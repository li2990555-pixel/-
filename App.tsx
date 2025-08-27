import React, { useState, useEffect, useMemo } from 'react';

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

const contentData = {
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

const initialPlainItems: Record<keyof typeof contentData, Item[]> = {
    docs: [
        { id: 'item-1', name: '一本《小王子》', type: 'plain' },
        { id: 'item-2', name: '一张手绘的地图', type: 'plain' },
        { id: 'item-3', name: '一支沾着墨水的钢笔', type: 'plain' },
    ],
    network: [
        { id: 'item-4', name: '那本未读完的《高等数学》', type: 'plain' },
        { id: 'item-5', name: '一份带有红色箭头（下跌）的股票报告', type: 'plain' },
        { id: 'item-6', name: '一杯浓茶', type: 'plain' },
    ],
    recycle: [],
};

const recipes: Record<string, string> = {
    "一本《小王子》|一张手绘的地图": "星空航路图",
    "一本《小王子》|一支沾着墨水的钢笔": "童话之笔",
    "一张手绘的地图|一支沾着墨水的钢笔": "探险家日记",
    "一份带有红色箭头（下跌）的股票报告|那本未读完的《高等数学》": "确定性公式",
    "一杯浓茶|那本未读完的《高等数学》": "苦涩人生公式",
    "一杯浓茶|一份带有红色箭头（下跌）的股票报告": "风险与代价",
    "一本《小王子》|一份带有红色箭头（下跌）的股票报告": "被定价的玫瑰",
    "一本《小王子》|一杯浓茶": "苦涩的星光",
    "一杯浓茶|一张手绘的地图": "流淌着泪水的航路",
    "一份带有红色箭头（下跌）的股票报告|一支沾着墨水的钢笔": "冰冷的笔触",
    "一杯浓茶|一支沾着墨水的钢笔": "墨香的苦涩",
};

const sacredItemEffects: Record<string, { title: string; message: string }> = {
    "星空航路图": { title: "治愈发生", message: "你找回了童年时对星空的向往，和那份不受拘束的想象力。你意识到，内心的宇宙，远比现实的枷锁要广阔。" },
    "童话之笔": { title: "治愈发生", message: "你重新获得了用纯真视角描绘世界的能力。那些被“理性”划掉的奇思妙想，现在都重新闪耀着光芒。" },
    "探险家日记": { title: "治愈发生", message: "你肯定了自我探索的价值。你明白，人生的地图并非只有一条世俗意义上的成功路径，每一条岔路都有独特的风景。" },
    "确定性公式": { title: "治愈发生", message: "父亲理解了，冰冷的数字背后也可以有温度。他开始在不确定的市场中，寻找家庭带来的那份“确定”的幸福。" },
    "苦涩人生公式": { title: "治愈发生", message: "父亲释然了，他明白了人生的苦涩是常态，但不代表没有解。他开始在苦涩的茶中，品味生活的回甘。" },
    "风险与代价": { title: "治愈发生", message: "父亲放下了对失控的恐惧。他认识到，最大的风险不是投资失败，而是错过与家人共度的时光。" },
    "被定价的玫瑰": { title: "治愈发生", message: "你与父亲都明白了，世界上有些珍贵的东西是无法用金钱衡量的，比如爱，比如梦想。" },
    "苦涩的星光": { title: "治愈发生", message: "你们理解了彼此的重担。父亲的浓茶与你的星光，都是为了守护心中重要之物而付出的努力。" },
    "流淌着泪水的航路": { title: "治愈发生", message: "你明白了父亲的苦涩，父亲也看到了你内心的航图。你们的泪水汇成河流，载着理解与爱，流向远方。" },
    "冰冷的笔触": { title: "治愈发生", message: "你与父亲都意识到，无论是冰冷的数字还是感性的文字，都不应成为伤害对方的武器，而应是沟通的桥梁。" },
    "墨香的苦涩": { title: "治愈发生", message: "你们在彼此的世界里，品尝到了对方的味道。文字的墨香与茶的苦涩交织，成了独属于你们的和解的滋味。" }
};


// --- UI Components ---

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
            <div className="p-4 bg-white flex-grow m-1 font-mono text-black overflow-y-auto">
                {typeof content === 'string' && <p className="whitespace-pre-wrap">{content}</p>}
                {Array.isArray(content) && content.map((line, i) => <p key={i}>{line}</p>)}
            </div>
        </div>
    );
};

const DesktopIcon = ({ icon, name, onDoubleClick }: { icon: JSX.Element; name: string; onDoubleClick: () => void; }) => (
    <div 
        className="flex flex-col items-center justify-center p-2 rounded cursor-pointer hover:bg-blue-500 hover:bg-opacity-50 focus:bg-blue-500 focus:bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-300" 
        onDoubleClick={onDoubleClick}
        tabIndex={0} // Make it focusable
        onKeyDown={(e) => { if (e.key === 'Enter') onDoubleClick(); }}
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

const HealingWindow = ({ title, message, onClose }: { title: string; message: string; onClose: () => void; }) => (
    <div className="absolute inset-0 bg-black/60 flex justify-center items-center z-50 backdrop-blur-sm">
        <div 
            className="bg-[#C0C0C0] border-2 border-solid border-t-white border-l-white border-r-black border-b-black shadow-lg w-[500px] flex flex-col animate-fade-in"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="healing-title"
            aria-describedby="healing-message"
        >
            <div className="bg-[#000080] text-white p-1 flex justify-between items-center">
                <span id="healing-title" className="font-bold">{title}</span>
            </div>
            <div className="p-6 bg-white flex-grow m-1 font-mono text-black text-center flex flex-col justify-center items-center space-y-4">
                <p id="healing-message" className="text-lg">{message}</p>
                <button 
                    onClick={onClose} 
                    className="bg-[#C0C0C0] border-2 border-solid border-t-white border-l-white border-r-black border-b-black px-8 py-1 font-bold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    关闭
                </button>
            </div>
        </div>
    </div>
);

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

    useEffect(() => {
        const timer = setTimeout(onBootComplete, 1500);
        return () => clearTimeout(timer);
    }, [onBootComplete]);

    return (
        <div className="bg-black text-green-400 font-mono h-screen w-screen p-4 flex flex-col justify-center items-start text-lg overflow-hidden">
            {bootLines.map((line, i) => (
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
                <p>“历史地描绘过去并不意味着“按它本来的样子”去认识它，而是意味着捕获一种记忆，意味着当记忆在危险的关头闪现出来时将其把握。”</p>
                <footer className="mt-4 text-right">— 瓦尔特·本雅明《历史哲学论纲》</footer>
            </blockquote>
            <p className="mt-12 text-gray-400 animate-pulse">点击任意处继续...</p> 
        </div>
    );
};

const Desktop = ({ onAllOpened }: { onAllOpened: () => void }) => {
    const [activeWindow, setActiveWindow] = useState<keyof typeof contentData | null>(null);
    const [openedIcons, setOpenedIcons] = useState<Set<keyof typeof contentData>>(new Set());
    
    // Item related state
    const [inventory, setInventory] = useState<Item[]>([]);
    const [synthesisSlots, setSynthesisSlots] = useState<Array<Item | null>>([null, null]);
    const [collectedWindows, setCollectedWindows] = useState<Set<string>>(new Set());
    const [showFailToast, setShowFailToast] = useState(0); // Use a counter to re-trigger effect
    const [healingEffect, setHealingEffect] = useState<{ title: string; message: string } | null>(null);

    const handleOpen = (icon: keyof typeof contentData) => {
        setActiveWindow(icon);
        const newOpened = new Set(openedIcons).add(icon);
        setOpenedIcons(newOpened);
        
        if (!collectedWindows.has(icon)) {
            setInventory(prev => [...prev, ...initialPlainItems[icon]]);
            setCollectedWindows(new Set(collectedWindows).add(icon));
        }
        
        if (newOpened.size === Object.keys(contentData).length) {
            setTimeout(onAllOpened, 3000);
        }
    };
    
    const handleClose = () => setActiveWindow(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: Item) => {
        e.dataTransfer.setData("item", JSON.stringify(item));
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

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
            const sortedNames = [item1.name, item2.name].sort().join('|');
            const resultName = recipes[sortedNames];

            if (resultName) {
                const newItem: Item = {
                    id: `sacred-${Date.now()}`,
                    name: resultName,
                    type: 'sacred'
                };
                setInventory(prev => [...prev, newItem]);
                setSynthesisSlots([null, null]);
                if (sacredItemEffects[resultName]) {
                    setHealingEffect(sacredItemEffects[resultName]);
                }
            } else {
                setShowFailToast(count => count + 1);
                setInventory(prev => [...prev, item1, item2]);
                setSynthesisSlots([null, null]);
            }
        }
    }, [synthesisSlots]);

    return (
        <div className="h-screen w-screen overflow-hidden bg-black flex flex-col" onDragOver={handleDragOver} onDrop={handleDropOnInventory}>
            {/* Main content area */}
            <div className="flex-grow flex">
                {/* Icon Bar */}
                <div className="p-4 flex flex-col gap-8">
                    <DesktopIcon icon={<MyDocumentsIcon />} name="我的文档" onDoubleClick={() => handleOpen('docs')} />
                    <DesktopIcon icon={<NetworkNeighborhoodIcon />} name="网上邻居" onDoubleClick={() => handleOpen('network')} />
                    <DesktopIcon icon={<RecycleBinIcon />} name="回收站" onDoubleClick={() => handleOpen('recycle')} />
                </div>
            </div>

            {/* Item Bar */}
            <div className="w-full h-24 bg-gray-800/70 border-t-2 border-gray-600 flex items-center p-2 shadow-inner backdrop-blur-sm">
                <div className="flex gap-1">
                    <button aria-label="Scroll left" className="w-10 h-10 bg-gray-700 text-white rounded border border-gray-500 hover:bg-gray-600 transition-colors">{'<'}</button>
                    <button aria-label="Scroll right" className="w-10 h-10 bg-gray-700 text-white rounded border border-gray-500 hover:bg-gray-600 transition-colors">{'>'}</button>
                </div>
                
                <div className="flex-grow h-full bg-black/30 mx-4 rounded border border-gray-700 flex items-center p-2 gap-2 overflow-x-auto">
                    {inventory.map(item => (
                        <div 
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            className={`w-16 h-16 p-1 flex justify-center items-center rounded-md border-2 transition-all duration-200 cursor-grab ${
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

                {/* Synthesis Area */}
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

            {/* Windows and modals */}
            {activeWindow && (
                <Window
                    title={contentData[activeWindow].title}
                    content={contentData[activeWindow].content}
                    onClose={handleClose}
                />
            )}
            
            <Toast message="这两个道具无法合成" show={showFailToast} />

            {healingEffect && (
                <HealingWindow 
                    title={healingEffect.title}
                    message={healingEffect.message}
                    onClose={() => setHealingEffect(null)}
                />
            )}
        </div>
    );
};

const EndingScreen = () => (
    <div className="bg-black text-white font-serif h-screen w-screen flex flex-col justify-center items-center p-8">
         <div className="text-2xl max-w-3xl text-center leading-relaxed space-y-6">
            <p>你和父亲，终于在各自的世界里，看到了彼此。</p>
            <p>裂痕被理解的暖流弥合。破碎的圆，重新变得完整。</p>
            <p>原来，快乐星球，不在遥远的星际，而在每一个愿意沟通与和解的，当下。</p>
        </div>
    </div>
);

const App = () => {
    const [stage, setStage] = useState<'boot' | 'quote' | 'desktop' | 'ending'>('boot');

    const handleAllOpened = () => {
        setStage('ending');
    };

    switch (stage) {
        case 'boot':
            return <BootScreen onBootComplete={() => setStage('quote')} />;
        case 'quote':
            return <BenjaminQuote onContinue={() => setStage('desktop')} />;
        case 'desktop':
            return <Desktop onAllOpened={handleAllOpened} />;
        case 'ending':
            return <EndingScreen />;
        default:
            return <BootScreen onBootComplete={() => setStage('quote')} />;
    }
};

export default App;
