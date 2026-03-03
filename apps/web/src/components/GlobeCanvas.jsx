import { useEffect, useRef } from 'react';

/**
 * GlobeCanvas – A self-contained rotating 3D globe built with pure Canvas 2D.
 * No external libraries. Matches the HackerRank-style dark globe aesthetic.
 *
 * Props:
 *   size       – pixel size of the canvas (default 420)
 *   dotColor   – color of dots (default '#00d65b')
 *   lineColor  – color of arc lines (default 'rgba(0,214,91,0.25)')
 *   bgColor    – fill behind globe (default 'transparent')
 *   speed      – rotation speed multiplier (default 1)
 */
const GlobeCanvas = ({
    size = 420,
    dotColor = '#00d65b',
    lineColor = 'rgba(0, 214, 91, 0.25)',
    bgColor = 'transparent',
    speed = 1,
}) => {
    const canvasRef = useRef(null);
    const rafRef = useRef(null);
    const angleRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        ctx.scale(dpr, dpr);

        const cx = size / 2;
        const cy = size / 2;
        const R = size * 0.42; // globe radius

        // ── Generate random "globe points" using spherical coordinates ──────────
        const NUM_DOTS = 280;
        const dots = [];
        for (let i = 0; i < NUM_DOTS; i++) {
            // Uniform distribution on sphere surface
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;   // longitude
            const phi = Math.acos(2 * v - 1); // latitude
            dots.push({ theta, phi });
        }

        // ── Generate arc connections between nearby dots ────────────────────────
        const NUM_ARCS = 60;
        const arcs = [];
        for (let i = 0; i < NUM_ARCS; i++) {
            const a = Math.floor(Math.random() * NUM_DOTS);
            let b = Math.floor(Math.random() * NUM_DOTS);
            // Keep only nearby pairs
            const dPhi = Math.abs(dots[a].phi - dots[b].phi);
            const dTheta = Math.abs(dots[a].theta - dots[b].theta);
            if (dPhi < 0.8 && dTheta < 0.8) arcs.push([a, b]);
        }

        // ── Project a spherical point to 2D canvas ──────────────────────────────
        const project = (theta, phi, rotY) => {
            const x = R * Math.sin(phi) * Math.cos(theta + rotY);
            const y = R * Math.cos(phi);
            const z = R * Math.sin(phi) * Math.sin(theta + rotY);
            // Basic perspective depth factor
            const depth = (z + R) / (2 * R); // 0 (back) → 1 (front)
            return {
                sx: cx + x,
                sy: cy - y,
                depth,
                visible: z > -R * 0.05, // hide slightly behind horizon
            };
        };

        // ── Main render loop ─────────────────────────────────────────────────────
        const render = () => {
            ctx.clearRect(0, 0, size, size);
            angleRef.current += 0.003 * speed;
            const rot = angleRef.current;

            // Background fill
            if (bgColor !== 'transparent') {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, size, size);
            }

            // Globe base circle (subtle gradient)
            const grad = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, 0, cx, cy, R);
            grad.addColorStop(0, 'rgba(0,214,91,0.06)');
            grad.addColorStop(0.8, 'rgba(0,20,10,0.35)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.beginPath();
            ctx.arc(cx, cy, R, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            // Globe rim
            ctx.beginPath();
            ctx.arc(cx, cy, R, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0,214,91,0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Project all dots
            const projected = dots.map(({ theta, phi }) => project(theta, phi, rot));

            // Draw arcs first (behind dots)
            arcs.forEach(([ai, bi]) => {
                const a = projected[ai];
                const b = projected[bi];
                if (!a.visible || !b.visible) return;
                ctx.beginPath();
                ctx.moveTo(a.sx, a.sy);
                // Slight curve via midpoint raised toward center
                const mx = (a.sx + b.sx) / 2;
                const my = (a.sy + b.sy) / 2;
                const pull = 0.12;
                const cpx = mx + (cx - mx) * pull;
                const cpy = my + (cy - my) * pull;
                ctx.quadraticCurveTo(cpx, cpy, b.sx, b.sy);
                const alpha = ((a.depth + b.depth) / 2) * 0.6;
                ctx.strokeStyle = lineColor.replace(/[\d.]+\)$/, `${alpha})`);
                ctx.lineWidth = 0.7;
                ctx.stroke();
            });

            // Draw dots
            projected.forEach(({ sx, sy, depth, visible }) => {
                if (!visible) return;
                const r = depth * 2.2 + 0.4;
                const alpha = depth * 0.9 + 0.1;
                ctx.beginPath();
                ctx.arc(sx, sy, r, 0, Math.PI * 2);
                ctx.fillStyle = dotColor
                    .replace('rgb(', 'rgba(')
                    .replace(/\)$/, `,${alpha})`)
                    // handle hex – convert once to rgba shorthand
                    || `rgba(0,214,91,${alpha})`;

                // Simpler: always use rgba
                ctx.fillStyle = `rgba(0,214,91,${alpha})`;
                ctx.fill();
            });

            // Highlight shimmer (top-left bright arc)
            const shimmer = ctx.createRadialGradient(
                cx - R * 0.45, cy - R * 0.45, 0,
                cx - R * 0.3, cy - R * 0.3, R * 0.6
            );
            shimmer.addColorStop(0, 'rgba(255,255,255,0.04)');
            shimmer.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.beginPath();
            ctx.arc(cx, cy, R, 0, Math.PI * 2);
            ctx.fillStyle = shimmer;
            ctx.fill();

            rafRef.current = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(rafRef.current);
    }, [size, dotColor, lineColor, bgColor, speed]);

    return (
        <canvas
            ref={canvasRef}
            style={{ display: 'block', borderRadius: '50%' }}
        />
    );
};

export default GlobeCanvas;
