export default function Loading() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="animate-scaleIn card border border-[var(--mint)]/20 shadow-xl bg-[var(--bg-card)] p-8 max-w-xs w-full flex flex-col items-center justify-center space-y-5 rounded-3xl relative overflow-hidden">
                {/* Background glow blobs */}
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-[var(--mint-light)]/40 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-[var(--peach-light)]/40 rounded-full blur-2xl pointer-events-none" />

                {/* Animated Mascot Ring Widget */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                    {/* Outer Dual-Color Spinning Ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-t-[var(--mint)] border-r-[var(--peach)] border-b-[var(--lavender)] border-l-transparent animate-spin" />

                    {/* Inner Floating Mascot */}
                    <div className="w-16 h-16 rounded-full bg-[var(--mint-light)]/40 flex items-center justify-center shadow-inner animate-pulse">
                        <span className="text-3xl">🥑</span>
                    </div>
                </div>

                {/* Branding & Status Text */}
                <div className="space-y-1.5">
                    <h2 className="font-extrabold text-2xl tracking-tight text-[var(--mint-dark)] dark:text-[var(--mint)]">
                        CalPal
                    </h2>
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                        <span>Loading page</span>
                        <span className="flex space-x-1">
                            <span className="w-1.5 h-1.5 bg-[var(--mint)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-[var(--peach)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-[var(--lavender)] rounded-full animate-bounce" />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}