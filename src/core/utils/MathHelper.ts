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

    // --- LIVE EVALUATION (JS AST) ---
    public static evaluateUnary(funcName: string, val: number): number {
        if (funcName === 'fract') return val - Math.floor(val);
        return (Math as any)[funcName]?.(val) ?? val;
    }

    public static evaluateBinary(op: string, a: number, b: number): number {
        if (op === 'add') return a + b;
        if (op === 'subtract') return a - b;
        if (op === 'multiply') return a * b;
        if (op === 'divide') return b !== 0 ? a / b : 0;
        if (op === 'pow') return Math.pow(a, b);
        if (op === 'max') return Math.max(a, b);
        if (op === 'min') return Math.min(a, b);
        return a * b; // default
    }

    public static evaluateVectorScalar(op: string, vec: any, scalar: number): any {
        const v = vec || { x: 0, y: 0, z: 0 };
        const vx = v.x ?? v.r ?? 0;
        const vy = v.y ?? v.g ?? 0;
        const vz = v.z ?? v.b ?? 0;

        return {
            x: this.evaluateBinary(op, vx, scalar),
            y: this.evaluateBinary(op, vy, scalar),
            z: this.evaluateBinary(op, vz, scalar)
        };
    }

    public static evaluateVector(op: string, vecA: any, vecB: any): any {
        const a = vecA || { x: 0, y: 0, z: 0 };
        const b = vecB || { x: 0, y: 0, z: 0 };
        
        return {
            x: this.evaluateBinary(op, a.x ?? a.r ?? 0, b.x ?? b.r ?? 0),
            y: this.evaluateBinary(op, a.y ?? a.g ?? 0, b.y ?? b.g ?? 0),
            z: this.evaluateBinary(op, a.z ?? a.b ?? 0, b.z ?? b.b ?? 0)
        };
    }
}