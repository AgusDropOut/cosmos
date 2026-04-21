// src/core/utils/MathHelper.ts

export class MathHelper {
    public static getOperator(opStr: string): string {
        if (opStr === 'subtract') return '-';
        if (opStr === 'multiply') return '*';
        if (opStr === 'divide') return '/';
        return '+'; 
    }

    // --- FLOAT MATH ---
    public static generateBinaryGLSL(op: string, a: string, b: string, varName: string): string {
        if (['pow', 'max', 'min'].includes(op)) {
            return `    float ${varName} = ${op}(${a}, ${b});`;
        }
        return `    float ${varName} = ${a} ${this.getOperator(op)} ${b};`;
    }

    public static generateBinaryMath(op: string, a: string, b: string): string {
        if (['pow', 'max', 'min'].includes(op)) {
            return `${op}(${a}, ${b})`;
        }
        return `(${a} ${this.getOperator(op)} ${b})`;
    }

    // --- VECTOR MATH ---
    public static parseVec3(str: string): [string, string, string] {
        if (!str || !str.startsWith('vec3(') || !str.endsWith(')')) return ['0.0', '0.0', '0.0'];
        const inner = str.substring(5, str.length - 1);
        let depth = 0, lastIdx = 0;
        const parts: string[] = [];
        for (let i = 0; i < inner.length; i++) {
            if (inner[i] === '(') depth++;
            else if (inner[i] === ')') depth--;
            else if (inner[i] === ',' && depth === 0) {
                parts.push(inner.substring(lastIdx, i).trim());
                lastIdx = i + 1;
            }
        }
        parts.push(inner.substring(lastIdx).trim());
        return parts.length === 3 ? [parts[0], parts[1], parts[2]] : ['0.0', '0.0', '0.0'];
    }

    public static operateVector(opName: string, vecA: string, vecB: string): string {
        const op = this.getOperator(opName);
        const a = this.parseVec3(vecA);
        const b = this.parseVec3(vecB);
        return `vec3((${a[0]} ${op} ${b[0]}), (${a[1]} ${op} ${b[1]}), (${a[2]} ${op} ${b[2]}))`;
    }

    public static operateScalar(opName: string, vecStr: string, scalarStr: string): string {
        const op = this.getOperator(opName);
        const v = this.parseVec3(vecStr);
        return `vec3((${v[0]} ${op} ${scalarStr}), (${v[1]} ${op} ${scalarStr}), (${v[2]} ${op} ${scalarStr}))`;
    }
}