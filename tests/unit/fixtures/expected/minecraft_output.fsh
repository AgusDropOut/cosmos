#version 150

in vec2 vUv;
in vec4 vertexColor;
out vec4 fragColor;

uniform float CosmosTime;
uniform float u_alphaCutoff;




void main() {
    float node_float_1 = 1.0;
    fragColor = vec4(vec3(vec3(node_float_1)), 1.0);
if (fragColor.a <= u_alphaCutoff && u_alphaCutoff > 0.0) {
        discard;
    }
}