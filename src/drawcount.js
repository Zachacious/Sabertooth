import glCore from 'pixi-gl-core';
import bitTwiddle from 'bit-twiddle';

let TICK = 0;
let TEXTURE_TICK = 0;
let settings = PIXI.settings;

/**
*A Hack to get a draw count from renderer.plugins.sprite(PIXI.SpriteRenderer)
*Note: Ment to be used only temporarily to get a draw count
*@param {PIXI.SpriteRenderer} ren the sprite renderer to hack
*@example
* hackSpriteRendererDrawCounter(myApp.renderer.plugins.sprite);
* // main loop
* let main = function(){
*    myApp.renderer.plugins.sprite.draws = 0;
*    myApp.update();
*    myLabel.text = myApp.renderer.plugins.sprite.draws;
*    requestAnimationFrame(main);
*};
 */
let hackSpriteRendererDrawCounter = function(ren) { //eslint-disable-line
    ren.draws = 0;

    ren.flush = function() {
        if (this.currentIndex === 0) {
            return;
        }

        const gl = this.renderer.gl;
        const MAX_TEXTURES = this.MAX_TEXTURES;

        const np2 = bitTwiddle.nextPow2(this.currentIndex);
        const log2 = bitTwiddle.log2(np2);
        const buffer = this.buffers[log2];

        const sprites = this.sprites;
        const groups = this.groups;

        const float32View = buffer.float32View;
        const uint32View = buffer.uint32View;

        const boundTextures = this.boundTextures;
        const rendererBoundTextures = this.renderer.boundTextures;
        const touch = this.renderer.textureGC.count;

        let index = 0;
        let nextTexture;
        let currentTexture;
        let groupCount = 1;
        let textureCount = 0;
        let currentGroup = groups[0];
        let vertexData;
        let uvs;
        let blendMode = sprites[0].blendMode;

        currentGroup.textureCount = 0;
        currentGroup.start = 0;
        currentGroup.blend = blendMode;

        TICK++;

        let i;

        // copy textures..
        for (i = 0; i < MAX_TEXTURES; ++i) {
            boundTextures[i] = rendererBoundTextures[i];
            boundTextures[i]._virtalBoundId = i;
        }

        for (i = 0; i < this.currentIndex; ++i) {
            // upload the sprite elemetns...
            // they have all ready been calculated so we just need to
            // push them into the buffer.
            const sprite = sprites[i];

            nextTexture = sprite._texture.baseTexture;

            if (blendMode !== sprite.blendMode) {
                // finish a group..
                blendMode = sprite.blendMode;

                // force the batch to break!
                currentTexture = null;
                textureCount = MAX_TEXTURES;
                TICK++;
            }

            if (currentTexture !== nextTexture) {
                currentTexture = nextTexture;

                if (nextTexture._enabled !== TICK) {
                    if (textureCount === MAX_TEXTURES) {
                        TICK++;

                        currentGroup.size = i - currentGroup.start;

                        textureCount = 0;

                        currentGroup = groups[groupCount++];
                        currentGroup.blend = blendMode;
                        currentGroup.textureCount = 0;
                        currentGroup.start = i;
                    }

                    nextTexture.touched = touch;

                    if (nextTexture._virtalBoundId === -1) {
                        for (let j = 0; j < MAX_TEXTURES; ++j) {
                            const tIndex = (j + TEXTURE_TICK) % MAX_TEXTURES;

                            const t = boundTextures[tIndex];

                            if (t._enabled !== TICK) {
                                TEXTURE_TICK++;

                                t._virtalBoundId = -1;

                                nextTexture._virtalBoundId = tIndex;

                                boundTextures[tIndex] = nextTexture;
                                break;
                            }
                        }
                    }

                    nextTexture._enabled = TICK;

                    currentGroup.textureCount++;
                    currentGroup.ids[textureCount] = nextTexture._virtalBoundId;
                    currentGroup.textures[textureCount++] = nextTexture;
                }
            }

            vertexData = sprite.vertexData;

            // TODO this sum does not need to be set each frame..
            uvs = sprite._texture._uvs.uvsUint32;

            if (this.renderer.roundPixels) {
                const resolution = this.renderer.resolution;

                // xy
                float32View[index] = ((vertexData[0] * resolution) | 0)
                / resolution;
                float32View[index + 1] = ((vertexData[1] * resolution) | 0)
                 / resolution;

                // xy
                float32View[index + 5] = ((vertexData[2] * resolution) | 0)
                 / resolution;
                float32View[index + 6] = ((vertexData[3] * resolution) | 0)
                 / resolution;

                // xy
                float32View[index + 10] = ((vertexData[4] * resolution) | 0)
                 / resolution;
                float32View[index + 11] = ((vertexData[5] * resolution) | 0)
                 / resolution;

                // xy
                float32View[index + 15] = ((vertexData[6] * resolution) | 0)
                 / resolution;
                float32View[index + 16] = ((vertexData[7] * resolution) | 0)
                 / resolution;
            } else {
                // xy
                float32View[index] = vertexData[0];
                float32View[index + 1] = vertexData[1];

                // xy
                float32View[index + 5] = vertexData[2];
                float32View[index + 6] = vertexData[3];

                // xy
                float32View[index + 10] = vertexData[4];
                float32View[index + 11] = vertexData[5];

                // xy
                float32View[index + 15] = vertexData[6];
                float32View[index + 16] = vertexData[7];
            }

            uint32View[index + 2] = uvs[0];
            uint32View[index + 7] = uvs[1];
            uint32View[index + 12] = uvs[2];
            uint32View[index + 17] = uvs[3];

            /* eslint-disable max-len */
            uint32View[index + 3] = uint32View[index + 8] =
            uint32View[index + 13] = uint32View[index + 18] = sprite._tintRGB
            + (Math.min(sprite.worldAlpha, 1) * 255 << 24);

            float32View[index + 4] = float32View[index + 9] =
            float32View[index + 14] = float32View[index + 19] =
            nextTexture._virtalBoundId;
            /* eslint-enable max-len */

            index += 20;
        }

        currentGroup.size = i - currentGroup.start;

        if (!settings.CAN_UPLOAD_SAME_BUFFER) {
            // this is still needed for IOS performance..
            // it really does not like uploading to the same
            // buffer in a single frame!
            if (this.vaoMax <= this.vertexCount) {
                this.vaoMax++;

                const attrs = this.shader.attributes;

                /* eslint-disable max-len */
                const vertexBuffer = this.vertexBuffers[this.vertexCount] =
                glCore.GLBuffer.createVertexBuffer(gl, null, gl.STREAM_DRAW);
                /* eslint-enable max-len */

                // build the vao object that will render..
                const vao = this.renderer.createVao()
                    .addIndex(this.indexBuffer)
                    .addAttribute(vertexBuffer, attrs.aVertexPosition, gl.FLOAT,
                             false, this.vertByteSize, 0)
                    .addAttribute(vertexBuffer, attrs.aTextureCoord,
                            gl.UNSIGNED_SHORT, true, this.vertByteSize, 2 * 4)
                    .addAttribute(vertexBuffer, attrs.aColor,
                            gl.UNSIGNED_BYTE, true, this.vertByteSize, 3 * 4);

                if (attrs.aTextureId) {
                    vao.addAttribute(vertexBuffer, attrs.aTextureId,
                            gl.FLOAT, false, this.vertByteSize, 4 * 4);
                }

                this.vaos[this.vertexCount] = vao;
            }

            this.renderer.bindVao(this.vaos[this.vertexCount]);

            this.vertexBuffers[this.vertexCount]
            .upload(buffer.vertices, 0, false);

            this.vertexCount++;
        } else {
            // lets use the faster option, always use buffer number 0
            this.vertexBuffers[this.vertexCount]
            .upload(buffer.vertices, 0, true);
        }

        for (i = 0; i < MAX_TEXTURES; ++i) {
            rendererBoundTextures[i]._virtalBoundId = -1;
        }

        // PIXI.SpriteRenderer.Draws = 0;
        // this.draws = 0;
        // render the groups..
        for (i = 0; i < groupCount; ++i) {
            const group = groups[i];
            const groupTextureCount = group.textureCount;

            for (let j = 0; j < groupTextureCount; j++) {
                currentTexture = group.textures[j];

                // reset virtual ids..
                // lets do a quick check..
                if (rendererBoundTextures[group.ids[j]] !== currentTexture) {
                    this.renderer
                    .bindTexture(currentTexture, group.ids[j], true);
                }

                // reset the virtualId..
                currentTexture._virtalBoundId = -1;
            }

            // set the blend mode..
            this.renderer.state.setBlendMode(group.blend);

            gl.drawElements(gl.TRIANGLES, group.size * 6,
                    gl.UNSIGNED_SHORT, group.start * 6 * 2);
            this.draws++;
        }

        // reset elements for the next flush
        this.currentIndex = 0;
    };
};

export {hackSpriteRendererDrawCounter};
// PIXI.SpriteRenderer.flush = function() {
//
//     };
