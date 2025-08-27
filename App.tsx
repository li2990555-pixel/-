

import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- SVG Icon Components ---

const MyDocumentsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H10l2 2.5H17.5A2.5 2.5 0 0 1 20 8v10.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5v-13Z" fill="#FFD95A" stroke="#C07F00"/>
        <path d="M4.5 11h15" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.8"/>
    </svg>
);

const NetworkNeighborhoodIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12v4a2 2 0 0 1-2 2H6a2 2 0 0 1-4-2v-4" stroke="#B0E0E6"/>
        <path d="M12 18V7" stroke="#B0E0E6"/>
        <path d="M10 16h4" stroke="#B0E0E6"/>
        <path d="M8.5 7.6a4 4 0 1 1 7 0" fill="#B0E0E6" stroke="#B0E0E6"/>
        <path d="M12 7a2 2 0 0 1 2 2h-4a2 2 0 0 1 2-2z" fill="#333"/>
        <circle cx="12" cy="5" r="1" fill="white"/>
    </svg>
);

const RecycleBinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16" stroke="#E0E0E0"/>
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#E0E0E0"/>
        <path d="M18 6l-1.5 12.5a2 2 0 0 1-2 1.5H9.5a2 2 0 0 1-2-1.5L6 6" fill="rgba(224, 224, 224, 0.2)" stroke="#E0E0E0"/>
        <path d="M10 11v6" stroke="#E0E0E0"/>
        <path d="M14 11v6" stroke="#E0E0E0"/>
    </svg>
);

// --- Data ---
type IconKey = 'docs' | 'network' | 'recycle';

const initialContentData: Record<IconKey, { title: string; content: string | string[] }> = {
    docs: {
        title: "我的文档",
        content: `一个夜晚，我独自坐在书桌前，桌上堆着文科的书籍，如历史、文学、哲学。笔尖悬在纸上，我却迟迟没有落下。你脑中回荡着父亲那句“没有用”，让你对自己所选择的热爱产生了深深的怀疑。你感到自己的兴趣和才华，仿佛成了被社会标准评判的“废物”。`,
    },
    network: {
        title: "网上邻居",
        content: `爸爸的办公室或书房。电脑屏幕。桌上的茶杯里，枸杞和茶叶沉浮着。他疲惫地揉着太阳穴，桌上放着一本他年轻时未读完的《高等数学》。`,
    },
    recycle: {
        title: "回收站",
        content: [
            "我，这里。他，那里。",
			"中间，一张破碎的圆。汤，凉了。",
			"数字跳舞。文字游走。",
			"目光，交汇不了。只剩下，疲惫的影子。",
			"他眼里的K线，我笔下的诗。无声的河流。",
        ],
    },
};

interface Item {
    id: string;
    name: string;
    type: 'plain' | 'sacred';
}

const initialPlainItems: Record<IconKey, Item[]> = {
    docs: [
        { id: 'item-1', name: '《小王子》', type: 'plain' },
        { id: 'item-2', name: '手绘的地图', type: 'plain' },
        { id: 'item-3', name: '沾着墨水的钢笔', type: 'plain' },
    ],
    network: [
        { id: 'item-4', name: '《高等数学》', type: 'plain' },
        { id: 'item-5', name: '股票报告', type: 'plain' },
        { id: 'item-6', name: '浓茶', type: 'plain' },
    ],
    recycle: [],
};

// [Item1, Item2, Result]
const recipesList: [string, string, string][] = [
    ["《小王子》", "手绘的地图", "星空航路图"],
    ["《小王子》", "沾着墨水的钢笔", "童话之笔"],
    ["手绘的地图", "沾着墨水的钢笔", "探险家日记"],
    ["《高等数学》", "股票报告", "确定性公式"],
    ["《高等数学》", "浓茶", "苦涩人生公式"],
    ["股票报告", "浓茶", "风险与代价"],
    ["《小王子》", "《高等数学》", "星辰的方程式"],
    ["《小王子》", "股票报告", "被定价的玫瑰"],
    ["手绘的地图", "《高等数学》", "坐标系里的世界"],
    ["沾着墨水的钢笔", "《高等数学》", "逻辑的诗篇"],
];

const interactionEffects: Record<string, Partial<Record<IconKey, { type: 'heal' | 'no-heal', change: (prev: string | string[]) => string | string[] }>>> = {
    "星空航路图": {
        docs: { type: 'heal', change: (prev) => (prev as string).replace('深深的怀疑', '<s>深深的怀疑</s>') + '<new>你明白了，父亲看到的只是脚下的土地，而你，拥有的是整片星空。</new>' },
        network: { type: 'heal', change: (prev) => prev + '<new>电脑屏幕上的《高等数学》旁边，浮现出一片星空背景。他似乎想起了什么，原来复杂的公式也能描绘星辰的轨迹，就像那些看似无用的梦想。</new>' },
        recycle: { type: 'heal', change: (prev) => (prev as string[]).map(s => s === '中间，一张破碎的圆。汤，凉了。' ? '“破碎的圆”的裂痕中开始流淌星光，仿佛在被填补。汤，温了。' : s).concat('<new>他的K线，我的诗，都是探索未知世界的航路。</new>') },
    },
    "童话之笔": {
        docs: { type: 'heal', change: (prev) => (prev as string).replace('“没有用”', '“<s>没有用</s>”<new>（被一朵玫瑰花的墨迹覆盖）</new>') + '<new>笔尖落下，写下的不是迎合，而是内心最真实的童话。真正的价值，无需向世界证明。</new>' },
        network: { type: 'no-heal', change: (prev) => prev + '<new>电脑屏幕上浮现出一行字：“童话再美，也解不了生活的渴。” 然后迅速消失。</new>' },
        recycle: { type: 'no-heal', change: (prev) => (prev as string[]).map(s => s === '汤，凉了。' ? '汤，凉了。<new>（一滴墨水滴入，晕开成泪痕）</new>' : s).concat('<new>最纯真的话语，却无法抵达。</new>') },
    },
    "探险家日记": {
        docs: { type: 'heal', change: (prev) => (prev as string).replace('“废物”', '“<s>废物</s>”') + '<new>这不是废纸，这是我的精神世界的版图，每一个字都是我探索的足迹。</new>' },
        network: { type: 'heal', change: (prev) => prev + '<new>父亲疲惫揉着的太阳穴停住了，他似乎在屏幕上看到了自己年轻时的影子。他也曾有过想要画满世界的地图，只是后来，地图变成了K线图。</new>' },
        recycle: { type: 'no-heal', change: (prev) => (prev as string[]).map(s => s === '中间，一张破碎的圆。汤，凉了。' ? '我们，在各自的地图上探险，背对背。' : s) },
    },
    "确定性公式": {
        docs: { type: 'no-heal', change: (prev) => prev + '<new>文本框中的文字（历史、文学、哲学）变得暗淡。试图用公式去衡量价值，只会让文字和情感变得苍白。</new>' },
        network: { type: 'heal', change: (prev) => (prev as string).replace('红色箭头（下跌）的股票报告', '<s>红色箭头（下跌）的</s>股票报告') + '<new>他长舒一口气，仿佛在波动的风险中找到了唯一的确定性，内心得到了片刻的安宁。</new>' },
        recycle: { type: 'no-heal', change: (prev) => (prev as string[]).map(s => s === '中间，一张破碎的圆。汤，凉了。' ? '破碎的圆旁边出现了一个巨大的等号，但等号两边空无一物。' : s).concat('<new>关系不是公式，无法计算，无法求解。</new>') },
    },
    "苦涩人生公式": {
        docs: { type: 'no-heal', change: (prev) => prev + '<new>你感到一阵窒息，书桌上的书籍被一个巨大的积分符号压住。原来人生的苦涩，也可以被量化成一道无解的题。</new>' },
        network: { type: 'heal', change: (prev) => prev + '<new>他喝了一口茶，看着屏幕上的公式。生活的苦，就像这道解不出的题，但每一天的推演，都是为了一个家。</new>' },
        recycle: { type: 'heal', change: (prev) => ['我们同意，暂时休战。'] },
    },
    "风险与代价": {
        docs: { type: 'no-heal', change: (prev) => prev + '<new>你笔下的文字开始变得犹豫。每一个选择，都有它的风险和代价。我的热爱，值得吗？ 之前的怀疑再次加深。</new>' },
        network: { type: 'heal', change: (prev) => prev + '<new>茶杯空了，屏幕上的K线也静止了。他闭上眼，每一次点击的背后，都是一场无人知晓的豪赌。</new>' },
        recycle: { type: 'no-heal', change: (prev) => (prev as string[]).map(s => s === '他眼里的K线，我笔下的诗。无声的河流。' ? '<new>他的风险，我的梦。他付代价，我写诗。</new>' : s) },
    },
    "星辰的方程式": {
        docs: { type: 'heal', change: (prev) => prev + '<new>你拿起笔，在纸上写下了一个公式：爱 + 梦想 = ∞。原来最浪漫的宇宙，也可以用最严谨的语言来描述。</new>' },
        network: { type: 'heal', change: (prev) => prev + '<new>电脑屏幕上，《高等数学》翻开，露出空白的扉页，上面缓缓写下一句话：“B612行星的坐标是多少？”</new>' },
        recycle: { type: 'heal', change: (prev) => ['<new>数字与文字，开始在破碎的圆上共舞。</new>'] },
    },
    "被定价的玫瑰": {
        docs: { type: 'no-heal', change: (prev) => prev + '<new>你仿佛看到自己珍爱的书籍被贴上了价格标签。当一切都可以被定价，我的玫瑰，还独一无二吗？</new>' },
        network: { type: 'no-heal', change: (prev) => prev + '<new>他看着屏幕，鼠标箭头停留在“卖出”按钮上。他喃喃自语：情感，是投资最大的风险。</new>' },
        recycle: { type: 'no-heal', change: (prev) => (prev as string[]).map(s => s === '汤，凉了。' ? '汤，凉了。<new>（一片玫瑰花瓣飘落，掉进了冰冷的汤里。）</new>' : s).concat('<new>珍贵之物，在不同的世界里，有着不同的价格。有时，一文不值。</new>') },
    },
    "坐标系里的世界": {
        docs: { type: 'no-heal', change: (prev) => prev + '<new>你想象中的文学世界被网格线覆盖。用坐标去规定内心世界的边界，是一种束缚，还是一种清晰？ 你感到了迷茫。</new>' },
        network: { type: 'heal', change: (prev) => prev + '<new>电脑屏幕上，K线图变成了一张世界地图，上面标注着精准的经纬度。他想去的地方，全都有精确的坐标。</new>' },
        recycle: { type: 'no-heal', change: (prev) => (prev as string[]).map(s => s === '我，这里。他，那里。' ? '我们在同一个坐标系里，却在不同的象限。' : s) },
    },
    "逻辑的诗篇": {
        docs: { type: 'heal', change: (prev) => prev + '<new>你写下的诗句开始自动对仗、押韵，结构工整无比。当表达被赋予了逻辑的骨架，它会更坚强，还是会失去灵魂？</new>' },
        network: { type: 'heal', change: (prev) => prev + '<new>屏幕上复杂的公式旁边，出现了一行注解，文字优美，解释了这个公式的哲学意义。他第一次发现，冰冷的数字背后，也能有诗意。</new>' },
        recycle: { type: 'no-heal', change: (prev) => (prev as string[]).map(s => s === '无声的河流。' ? '沉默，也是一种逻辑。' : s) },
    },
};

// --- Ending Data & Logic ---

type Ending = { title: string; description: string; };
type InteractionResults = Partial<Record<IconKey, 'heal' | 'no-heal'>>;

const endings: Record<string, Ending> = {
    compass: { title: '《迷失的罗盘》', description: '你没能克服对自我价值的怀疑，最终放弃了对文科的热爱。你屈服于父亲的期望，但内心感到迷茫和空虚。你的人生轨迹被彻底改变，而核心的冲突从未得到解决。' },
    bridge: { title: '《心与心的桥梁》', description: '你找到了自我价值，也理解了父亲焦虑背后的爱。在回收站，你用这份双向的理解，最终消解了沟通的障碍。你们之间不再有隔阂，找到了真正的沟通方式，共同走向了充满希望的未来。' },
    lie: { title: '《心照不宣的谎言》', description: '你通过治愈自我，获得了面对父亲的勇气。在回收站，你成功地与他达成了表面的和解，但由于你从未真正理解他内心的恐惧，这份平静只是一种心照不宣的妥协。你们避免了争吵，但真正的隔阂仍然存在，它像一粒种子，在未来随时可能再次发芽。' },
    worlds: { title: '《各自的世界》', description: '你已经找到了自我价值，也理解了父亲。但你没能将这份理解转化为实际的沟通。你们的关系变得相安无事，但只是因为你选择了不再与他争辩，各自活在自己的世界里，你感到一种孤独的平静。' },
    dinner: { title: '《破碎的家庭晚餐》', description: '你找到了自我价值，但当你试图去理解父亲时，选择了错误的交互方式，导致沟通彻底破裂。你们之间的关系陷入冰冷的僵局，家中的氛围令人窒息，核心问题未能解决。' },
};

const determineEnding = (results: InteractionResults): Ending => {
    const { docs, network, recycle } = results;

    if (docs === 'no-heal') return endings.compass;
    if (docs === 'heal' && network === 'heal' && recycle === 'heal') return endings.bridge;
    if (docs === 'heal' && network === 'no-heal' && recycle === 'heal') return endings.lie;
    if (docs === 'heal' && network === 'heal' && recycle === 'no-heal') return endings.worlds;
    if (docs === 'heal' && network === 'no-heal' && recycle === 'no-heal') return endings.dinner;
    
    // Fallback, though should not be reached with the current logic.
    return endings.compass;
};


// --- UI Components ---
const renderStyledText = (text: string) => {
    const parts = text.split(/(<s>.*?<\/s>|<new>.*?<\/new>)/g).filter(Boolean);
    return parts.map((part, index) => {
        if (part.startsWith('<s>')) {
            return <s key={index}>{part.slice(3, -4)}</s>;
        }
        if (part.startsWith('<new>')) {
            return <span key={index} className="text-green-700 animate-fade-in block mt-2">{part.slice(5, -6)}</span>;
        }
        return <span key={index}>{part}</span>;
    });
};

const Window = ({ title, content, onClose }: { title: string; content: string | string[]; onClose: () => void; }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: window.innerWidth / 2 - 250, y: window.innerHeight / 2 - 200 });
    const [rel, setRel] = useState<{x: number, y: number} | null>(null);

    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).tagName === 'BUTTON') return;
        setIsDragging(true);
        setRel({
            x: e.pageX - position.x,
            y: e.pageY - position.y
        });
        e.stopPropagation();
        e.preventDefault();
    };

    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!isDragging || !rel) return;
            setPosition({
                x: e.pageX - rel.x,
                y: e.pageY - rel.y
            });
        };
        const handleGlobalMouseUp = () => setIsDragging(false);
        
        if (isDragging) {
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging, rel]);

    return (
        <div 
            className="absolute bg-[#C0C0C0] border-2 border-solid border-t-white border-l-white border-r-black border-b-black shadow-lg w-[500px] h-[400px] flex flex-col"
            style={{ top: position.y, left: position.x }}
            aria-modal="true"
            role="dialog"
            aria-labelledby="window-title"
        >
            <div 
                className="bg-[#000080] text-white p-1 flex justify-between items-center cursor-move"
                onMouseDown={onMouseDown}
            >
                <span id="window-title" className="font-bold">{title}</span>
                <button onClick={onClose} aria-label="Close" className="bg-[#C0C0C0] border-2 border-solid border-t-white border-l-white border-r-black border-b-black w-5 h-5 flex justify-center items-center font-bold">X</button>
            </div>
            <div className="p-4 bg-white flex-grow m-1 font-mono text-black overflow-y-auto leading-relaxed whitespace-pre-wrap">
                 {typeof content === 'string' && <p>{renderStyledText(content)}</p>}
                 {Array.isArray(content) && content.map((line, i) => <p key={i}>{renderStyledText(line)}</p>)}
            </div>
        </div>
    );
};

const DesktopIcon = ({ icon, name, onDoubleClick, locked }: { icon: JSX.Element; name: string; onDoubleClick: () => void; locked?: boolean; }) => (
    <div 
        className={`flex flex-col items-center justify-center p-2 rounded cursor-pointer ${locked ? 'opacity-50' : 'hover:bg-blue-500 hover:bg-opacity-50 focus:bg-blue-500 focus:bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-300'}`}
        onDoubleClick={onDoubleClick}
        tabIndex={locked ? -1 : 0}
        onKeyDown={(e) => { if (!locked && e.key === 'Enter') onDoubleClick(); }}
    >
        {icon}
        <span className="text-white text-sm mt-1 text-center drop-shadow-lg">{name}</span>
    </div>
);

const Toast = ({ message, show }: { message: string; show: number }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (show > 0) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [show]);

    return (
        <div 
            className={`absolute bottom-28 right-4 bg-red-800 text-white p-3 rounded-lg shadow-xl transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
            role="alert"
        >
            {message}
        </div>
    );
};


// --- Main Application Stages ---

const BootScreen = ({ onBootComplete }: { onBootComplete: () => void }) => {
    const bootLines = useMemo(() => [
        "PhoenixBIOS 4.0 Release 6.0",
        "Copyright 1982-2024 Phoenix Technologies Ltd.",
        "All Rights Reserved",
        "",
        "CPU = 1x Generic AI Core @ 7.1 THz",
        "Memory Test: 16384000K OK",
        "",
        "Initializing USB Controllers ... Done",
        "Initializing IDE Bus ... Done",
        "Initializing Network Stack ... Done",
        "Loading Operating System ...",
        "Starting K-OS v1.0 ...",
        "",
        "Welcome to 快乐星球.",
    ], []);

    const [displayedLines, setDisplayedLines] = useState<string[]>([]);

    useEffect(() => {
        if (displayedLines.length < bootLines.length) {
            const timer = setTimeout(() => {
                setDisplayedLines(prev => [...prev, bootLines[prev.length]]);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            const finalTimer = setTimeout(onBootComplete, 500);
            return () => clearTimeout(finalTimer);
        }
    }, [displayedLines, bootLines, onBootComplete]);

    return (
        <div className="bg-black text-green-400 font-mono h-screen w-screen p-4 flex flex-col justify-center items-start text-lg overflow-hidden">
            {displayedLines.map((line, i) => (
                <p key={i}><span className="mr-2">{'>'}</span>{line}</p>
            ))}
             <p><span className="blinking-cursor">{'>'}</span></p>
        </div>
    );
};

const BenjaminQuote = ({ onContinue }: { onContinue: () => void }) => {
    const [fading, setFading] = useState(false);

    const handleClick = () => {
        setFading(true);
        setTimeout(onContinue, 500); 
    };

    return (
        <div 
            className={`bg-black text-white font-serif h-screen w-screen flex flex-col justify-center items-center p-8 cursor-pointer transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
            aria-label="继续"
        >
            <blockquote className="text-2xl max-w-3xl text-center leading-relaxed">
                <p>历史地描绘过去并不意味着“按它本来的样子”去认识它，而是意味着捕获一种记忆，意味着当记忆在危险的关头闪现出来时将其把握。</p>
                <footer className="mt-4 text-right">——瓦尔特•本雅明《历史哲学论纲》</footer>
            </blockquote>
            <p className="mt-12 text-gray-400 animate-pulse">点击任意处继续...</p> 
        </div>
    );
};

const Desktop = ({ onGameEnd }: { onGameEnd: (results: InteractionResults) => void }) => {
    const [activeWindow, setActiveWindow] = useState<IconKey | null>(null);
    const [allContent, setAllContent] = useState(initialContentData);
    const [iconLocks, setIconLocks] = useState({ network: true, recycle: true });
    const [openedOnce, setOpenedOnce] = useState<Set<IconKey>>(new Set());
    const [interactedWindows, setInteractedWindows] = useState<Set<IconKey>>(new Set());
    const [interactionResults, setInteractionResults] = useState<InteractionResults>({});
    
    const [inventory, setInventory] = useState<Item[]>([]);
    const [synthesisSlots, setSynthesisSlots] = useState<Array<Item | null>>([null, null]);
    
    const [showFailToast, setShowFailToast] = useState(0);
    const [showLockToast, setShowLockToast] = useState(0);

    const [isDraggingSacred, setIsDraggingSacred] = useState(false);
    
    const handleOpen = (icon: IconKey) => {
        if (iconLocks[icon as keyof typeof iconLocks]) {
            setShowLockToast(c => c + 1);
            return;
        }
        setActiveWindow(icon);
        if (!openedOnce.has(icon)) {
            setInventory(prev => [...prev, ...initialPlainItems[icon]]);
            setOpenedOnce(new Set(openedOnce).add(icon));
        }
    };
    
    const handleClose = () => setActiveWindow(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: Item) => {
        e.dataTransfer.setData("item", JSON.stringify(item));
        if (item.type === 'sacred') {
            setIsDraggingSacred(true);
        }
    };

    const handleGlobalDragEnd = () => {
        setIsDraggingSacred(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
    
    const handleDropOnIcon = (e: React.DragEvent<HTMLDivElement>, target: IconKey) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingSacred(false);

        const itemJSON = e.dataTransfer.getData("item");
        if (!itemJSON) return;
        const droppedItem: Item = JSON.parse(itemJSON);

        if (droppedItem.type !== 'sacred' || interactedWindows.has(target)) {
            return;
        }

        const effect = interactionEffects[droppedItem.name]?.[target];
        if (effect) {
            setAllContent(prev => ({
                ...prev,
                [target]: { ...prev[target], content: effect.change(prev[target].content) }
            }));

            setInventory(prev => prev.filter(i => i.id !== droppedItem.id));
            
            const newInteracted = new Set(interactedWindows).add(target);
            setInteractedWindows(newInteracted);

            const newResults = { ...interactionResults, [target]: effect.type };
            setInteractionResults(newResults);

            if (target === 'docs' && effect.type === 'heal') {
                setIconLocks({ network: false, recycle: false });
            }

            if (target === 'docs' && effect.type === 'no-heal') {
                 setTimeout(() => onGameEnd(newResults), 2000);
                 return;
            }

            if (newInteracted.size === 3) {
                setTimeout(() => onGameEnd(newResults), 2000);
            }
        }
    };

    const handleDropOnSynthesis = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        const itemJSON = e.dataTransfer.getData("item");
        if (!itemJSON) return;

        const droppedItem: Item = JSON.parse(itemJSON);
        
        const fromInventory = inventory.some(i => i.id === droppedItem.id);
        if (!fromInventory || synthesisSlots[index]) return;

        setInventory(prev => prev.filter(i => i.id !== droppedItem.id));
        setSynthesisSlots(prev => {
            const newSlots = [...prev];
            newSlots[index] = droppedItem;
            return newSlots as [Item | null, Item | null];
        });
    };
    
    const handleDropOnInventory = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const itemJSON = e.dataTransfer.getData("item");
        if (!itemJSON) return;

        const droppedItem: Item = JSON.parse(itemJSON);
        const fromSlotIndex = synthesisSlots.findIndex(slot => slot?.id === droppedItem.id);

        if (fromSlotIndex > -1) {
             setSynthesisSlots(prev => {
                const newSlots = [...prev];
                newSlots[fromSlotIndex] = null;
                return newSlots as [Item | null, Item | null];
            });
            setInventory(prev => [...prev, droppedItem]);
        }
    };

    useEffect(() => {
        const [item1, item2] = synthesisSlots;
        if (item1 && item2) {
            const sortedNames = [item1.name, item2.name].sort();
            const recipe = recipesList.find(r => {
                const sortedRecipeItems = [r[0], r[1]].sort();
                return sortedRecipeItems[0] === sortedNames[0] && sortedRecipeItems[1] === sortedNames[1];
            });

            setSynthesisSlots([null, null]); // Clear slots for both cases

            if (recipe) {
                const resultName = recipe[2];
                const newItem: Item = { id: `sacred-${Date.now()}`, name: resultName, type: 'sacred' };
                setInventory(prev => [...prev, newItem]);
            } else {
                setShowFailToast(count => count + 1);

                // Check for the dead-end condition:
                // After 2 interactions, if the player attempts to combine their last 2 plain items and fails, the game ends.
                const isDeadEnd = 
                    interactedWindows.size === 2 &&
                    inventory.length === 0 && // This implies the only items in play were the two in the slots
                    item1.type === 'plain' &&
                    item2.type === 'plain';

                if (isDeadEnd) {
                    const allIcons: IconKey[] = ['docs', 'network', 'recycle'];
                    const remainingIcon = allIcons.find(icon => !interactedWindows.has(icon));
                    
                    if (remainingIcon) {
                        const finalResults = { ...interactionResults, [remainingIcon]: 'no-heal' as const };
                        // Briefly return items to inventory for visual feedback before ending.
                        setInventory([item1, item2]); 
                        setTimeout(() => onGameEnd(finalResults), 1500); // Give user time to see the toast.
                    } else {
                        // Fallback: should not be reached if interactedWindows.size is 2.
                        setInventory(prev => [...prev, item1, item2]);
                    }
                } else {
                    // Normal failed synthesis: just return the items to the inventory.
                    setInventory(prev => [...prev, item1, item2]);
                }
            }
        }
    }, [synthesisSlots, inventory, interactedWindows, interactionResults, onGameEnd]);


    const IconWrapper = ({ children, target }: { children: React.ReactNode; target: IconKey; }) => {
        const canDrop = isDraggingSacred && !interactedWindows.has(target) && !iconLocks[target as keyof typeof iconLocks];
        return (
            <div
                onDrop={(e) => handleDropOnIcon(e, target)}
                onDragOver={handleDragOver}
                className={`p-2 rounded-lg transition-all ${canDrop ? 'bg-blue-500/50 ring-2 ring-white' : ''}`}
            >
                {children}
            </div>
        );
    };

    return (
        <div className="h-screen w-screen overflow-hidden bg-black flex flex-col" onDragOver={handleDragOver} onDrop={handleDropOnInventory} onDragEnd={handleGlobalDragEnd}>
            <div className="flex-grow flex">
                <div className="p-4 flex flex-col gap-4">
                    <IconWrapper target="docs">
                        <DesktopIcon icon={<MyDocumentsIcon />} name="我的文档" onDoubleClick={() => handleOpen('docs')} />
                    </IconWrapper>
                    <IconWrapper target="network">
                        <DesktopIcon icon={<NetworkNeighborhoodIcon />} name="网上邻居" onDoubleClick={() => handleOpen('network')} locked={iconLocks.network} />
                    </IconWrapper>
                    <IconWrapper target="recycle">
                        <DesktopIcon icon={<RecycleBinIcon />} name="回收站" onDoubleClick={() => handleOpen('recycle')} locked={iconLocks.recycle} />
                    </IconWrapper>
                </div>
            </div>

            <div className="w-full h-24 bg-gray-800/70 border-t-2 border-gray-600 flex items-center p-2 shadow-inner backdrop-blur-sm">
                 <div className="flex-grow h-full bg-black/30 mx-4 rounded border border-gray-700 flex items-center p-2 gap-2 overflow-x-auto">
                    {inventory.map(item => (
                        <div 
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            className={`w-16 h-16 p-1 flex-shrink-0 flex justify-center items-center rounded-md border-2 transition-all duration-200 cursor-grab ${
                                item.type === 'sacred' 
                                    ? 'bg-yellow-200 border-yellow-500 shadow-lg shadow-yellow-500/50' 
                                    : 'bg-gray-700 border-gray-500'
                            }`}
                            title={item.name}
                        >
                            <span className={`text-xs text-center ${item.type === 'sacred' ? 'text-yellow-900 font-bold' : 'text-white'}`}>
                                {item.name}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-2 border-l-2 border-gray-600 pl-4 ml-4">
                    {[0, 1].map(index => (
                        <div 
                            key={index}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDropOnSynthesis(e, index)}
                            className="w-20 h-20 bg-black/50 border-2 border-dashed border-gray-500 rounded-lg flex justify-center items-center"
                        >
                            {synthesisSlots[index] && (
                                <div 
                                    draggable 
                                    onDragStart={(e) => handleDragStart(e, synthesisSlots[index]!)}
                                    className="w-16 h-16 p-1 flex justify-center items-center rounded-md bg-gray-700 border-2 border-gray-500 cursor-grab"
                                    title={synthesisSlots[index]!.name}
                                >
                                    <span className="text-xs text-white text-center">{synthesisSlots[index]!.name}</span>
                                </div>
                            )}
                        </div>
                    ))}
                    <div className="text-white text-4xl font-bold px-2">=</div>
                    <div className="w-20 h-20 bg-black/50 border-2 border-gray-500 rounded-lg flex justify-center items-center text-gray-400">?</div>
                </div>
            </div>

            {activeWindow && (
                <Window
                    title={allContent[activeWindow].title}
                    content={allContent[activeWindow].content}
                    onClose={handleClose}
                />
            )}
            
            <Toast message="这两个道具无法合成" show={showFailToast} />
            <Toast message="此图标尚未解锁" show={showLockToast} />

        </div>
    );
};

const EndingScreen = ({ title, description, onRestart }: { title: string, description: string, onRestart: () => void }) => {
    return (
        <div className="bg-black text-white font-serif h-screen w-screen flex flex-col justify-center items-center p-8 animate-fade-in">
            <div className="text-2xl max-w-3xl text-center leading-relaxed">
                <h1 className="text-4xl font-bold mb-4">{title}</h1>
                <p>{description}</p>
                <button 
                    onClick={onRestart}
                    className="mt-8 px-6 py-2 border border-white rounded hover:bg-white hover:text-black transition-colors"
                >
                    重新开始
                </button>
            </div>
        </div>
    );
};

const App = () => {
    const [gameState, setGameState] = useState<'boot' | 'quote' | 'desktop' | 'end'>('boot');
    const [ending, setEnding] = useState<Ending | null>(null);

    const handleBootComplete = useCallback(() => setGameState('quote'), []);
    const handleQuoteContinue = useCallback(() => setGameState('desktop'), []);

    const handleGameEnd = useCallback((results: InteractionResults) => {
        const finalEnding = determineEnding(results);
        setEnding(finalEnding);
        setGameState('end');
    }, []);

    const handleRestart = useCallback(() => {
        setEnding(null);
        setGameState('boot');
    }, []);

    if (gameState === 'boot') {
        return <BootScreen onBootComplete={handleBootComplete} />;
    }
    if (gameState === 'quote') {
        return <BenjaminQuote onContinue={handleQuoteContinue} />;
    }
    if (gameState === 'desktop') {
        return <Desktop onGameEnd={handleGameEnd} />;
    }
    if (gameState === 'end' && ending) {
        return <EndingScreen title={ending.title} description={ending.description} onRestart={handleRestart} />;
    }
    return <div>Loading...</div>; // Fallback
};

export default App;