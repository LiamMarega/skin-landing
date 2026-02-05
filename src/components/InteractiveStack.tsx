import { motion, useMotionValue, useTransform, type PanInfo } from 'motion/react';
import { useState, useEffect } from 'react';
import './InteractiveStack.css';

interface CardRotateProps {
    children: React.ReactNode;
    onSendToBack: () => void;
    sensitivity: number;
    disableDrag?: boolean;
}

function CardRotate({ children, onSendToBack, sensitivity, disableDrag = false }: CardRotateProps) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [60, -60]);
    const rotateY = useTransform(x, [-100, 100], [-60, 60]);

    function handleDragEnd(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
        if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
            onSendToBack();
        } else {
            x.set(0);
            y.set(0);
        }
    }

    if (disableDrag) {
        return (
            <motion.div className="card-rotate-disabled" style={{ x: 0, y: 0 }}>
                {children}
            </motion.div>
        );
    }

    return (
        <motion.div
            className="card-rotate"
            style={{ x, y, rotateX, rotateY }}
            drag
            dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
            dragElastic={0.6}
            whileTap={{ cursor: 'grabbing' }}
            onDragEnd={handleDragEnd}
        >
            {children}
        </motion.div>
    );
}

interface StackProps {
    randomRotation?: boolean;
    sensitivity?: number;
    sendToBackOnClick?: boolean;
    cards?: React.ReactNode[];
    animationConfig?: { stiffness: number; damping: number };
    autoplay?: boolean;
    autoplayDelay?: number;
    pauseOnHover?: boolean;
    mobileClickOnly?: boolean;
    mobileBreakpoint?: number;
}

function Stack({
    randomRotation = false,
    sensitivity = 200,
    cards = [],
    animationConfig = { stiffness: 260, damping: 20 },
    sendToBackOnClick = false,
    autoplay = false,
    autoplayDelay = 3000,
    pauseOnHover = false,
    mobileClickOnly = false,
    mobileBreakpoint = 768
}: StackProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < mobileBreakpoint);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [mobileBreakpoint]);

    const shouldDisableDrag = mobileClickOnly && isMobile;
    const shouldEnableClick = sendToBackOnClick || shouldDisableDrag;

    const [stack, setStack] = useState<{ id: number; content: React.ReactNode }[]>([]);

    useEffect(() => {
        setStack(cards.map((content, index) => ({ id: index + 1, content })));
    }, [cards]);

    const sendToBack = (id: number) => {
        setStack(prev => {
            const newStack = [...prev];
            const index = newStack.findIndex(card => card.id === id);
            const [card] = newStack.splice(index, 1);
            newStack.unshift(card);
            return newStack;
        });
    };

    useEffect(() => {
        if (autoplay && stack.length > 1 && !isPaused) {
            const interval = setInterval(() => {
                const topCardId = stack[stack.length - 1].id;
                sendToBack(topCardId);
            }, autoplayDelay);

            return () => clearInterval(interval);
        }
    }, [autoplay, autoplayDelay, stack, isPaused]);

    if (stack.length === 0) return null;

    return (
        <div
            className="stack-container"
            onMouseEnter={() => pauseOnHover && setIsPaused(true)}
            onMouseLeave={() => pauseOnHover && setIsPaused(false)}
        >
            {stack.map((card, index) => {
                const randomRotate = randomRotation ? Math.random() * 10 - 5 : 0;
                return (
                    <CardRotate
                        key={card.id}
                        onSendToBack={() => sendToBack(card.id)}
                        sensitivity={sensitivity}
                        disableDrag={shouldDisableDrag}
                    >
                        <motion.div
                            className="card"
                            onClick={() => shouldEnableClick && sendToBack(card.id)}
                            animate={{
                                zIndex: index + 1,
                                rotateZ: (stack.length - index - 1) * 4 + randomRotate, // Reverse stack logic for visual stacking
                                scale: 1 + index * 0.05 - stack.length * 0.05,
                                transformOrigin: '90% 90%'
                            }}
                            initial={false}
                            transition={{
                                type: 'spring',
                                stiffness: animationConfig.stiffness,
                                damping: animationConfig.damping
                            }}
                        >
                            {card.content}
                        </motion.div>
                    </CardRotate>
                );
            })}
        </div>
    );
}

export default function InteractiveStack() {
    const cards = [
        // Card 1 (Bottom in original)
        (
            <div className="w-full h-full bg-zinc-900 border border-white/10 rounded-xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-white/5 to-black"></div>
            </div>
        ),
        // Card 2 (Middle in original)
        (
            <div className="w-full h-full bg-zinc-800 border border-white/10 rounded-xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-bl from-white/5 to-black"></div>
            </div>
        ),
        // Card 3 (Hero / Top in original)
        (
            <div className="w-full h-full bg-[#050505] border border-white/20 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/resources/textures/texture_02.webp')] opacity-20 mix-blend-overlay"></div>

                {/* Shine Animation */}
                <div className="absolute top-0 -left-full w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-shine pointer-events-none"></div>

                <div className="w-16 h-16 rounded-full border-2 border-accent/50 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(255,180,0,0.2)] bg-black/50 backdrop-blur-sm z-10">
                    <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">⚡️</span>
                </div>
                <h3 className="relative z-10 text-2xl font-black italic text-white leading-none uppercase tracking-tighter">SKIN LABS<br />PRO</h3>
                <div className="relative z-10 mt-4 px-3 py-1 bg-accent/10 border border-accent/20 rounded text-accent text-[10px] font-black uppercase tracking-widest">
                    All In One
                </div>
            </div>
        )
    ];

    return (
        <div style={{ width: '250px', height: '320px', position: 'relative' }}>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/20 blur-[60px] animate-pulse pointer-events-none"></div>
            <div className="absolute -top-10 -right-10 text-[10rem] font-black text-white/5 select-none leading-none pointer-events-none">10</div>

            <Stack
                cards={cards}
                randomRotation={true}
                sendToBackOnClick={true}
                sensitivity={100}
                animationConfig={{ stiffness: 200, damping: 20 }}
            />
        </div>
    );
}
