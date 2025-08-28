import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

// --- AI & Data Types ---

type IconKey = 'docs' | 'network' | 'recycle';

interface Item {
    id: string;
    name: string;
    type: 'plain' | 'sacred';
}

interface Recipe {
    item1: string;
    item2: string;
    result: string;
}

interface InteractionEffect {
    name: string;
    effects: Record<IconKey, { type: 'heal' | 'no-heal', change: string }>;
}

interface EndingContent {
    description: string;
}

interface GameData {
    initialContentData: Record<IconKey, { title: string; content: string | string[] }>;
    initialPlainItems: Record<IconKey, { id: string, name: string, type: 'plain' }[]>;
    recipesList: Recipe[];
    interactionEffects: InteractionEffect[];
    endings: Record<'compass' | 'bridge' | 'lie' | 'worlds' | 'dinner', EndingContent>;
}

// --- SVG Icon Components (Unchanged) ---

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


// --- Ending Logic ---

type Ending = { title: string; description: string; };
type InteractionResults = Partial<Record<IconKey, 'heal' | 'no-heal'>>;

const determineEnding = (results: InteractionResults, endingsData: GameData['endings']): Ending => {
    const { docs, network, recycle } = results;

    if (docs === 'no-heal') {
        return { title: '《迷失的罗盘》', description: endingsData.compass.description };
    }
    if (docs === 'heal' && network === 'heal' && recycle === 'heal') {
        return { title: '《心与心的桥梁》', description: endingsData.bridge.description };
    }
    if (docs === 'heal' && network === 'no-heal' && recycle === 'heal') {
        return { title: '《心照不宣的谎言》', description: endingsData.lie.description };
    }
    if (docs === 'heal' && network === 'heal' && recycle === 'no-heal') {
        return { title: '《各自的世界》', description: endingsData.worlds.description };
    }
    if (docs === 'heal' && network === 'no-heal' && recycle === 'no-heal') {
        return { title: '《破碎的家庭晚餐》', description: endingsData.dinner.description };
    }
    
    // Fallback for any undefined state.
    return { title: '《迷失的罗盘》', description: endingsData.compass.description };
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


// --- Application Stages ---

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

type SceneData = {
    symbol: string;
    description: string;
    theme: string;
    confirmation: string;
};

const ALL_SCENES: SceneData[] = [
    { 
        symbol: "课后教室", 
        description: "空荡荡的课后教室",
        theme: "理解学业压力下的期望与关爱",
        confirmation: "原来是那张做不完的试卷……"
    },
    { 
        symbol: "书店角落", 
        description: "蒙尘的书店角落",
        theme: "跨越代沟，解读无言的守护与传承",
        confirmation: "原来是那本从未一起读完的书……"
    },
    { 
        symbol: "深夜厨房", 
        description: "只亮着一盏灯的深夜厨房",
        theme: "在日常的烟火气中，体会说不出口的家庭温情",
        confirmation: "原来是那碗悄悄温着的汤……"
    },
    { 
        symbol: "医院长廊", 
        description: "寂静无声的医院长廊",
        theme: "在脆弱的时刻，重新审视生命的重量与陪伴的意义",
        confirmation: "原来是那个迟迟不敢推开的病房门……"
    },
    { 
        symbol: "旧车站台", 
        description: "空无一人的旧车站台",
        theme: "面对成长中分道扬镳的遗憾与和解",
        confirmation: "原来是那趟没能赶上的列车……"
    },
    { 
        symbol: "屋顶天台", 
        description: "能看到城市夜景的屋顶天台",
        theme: "在迷茫的青春里，寻找未来的方向与自我认同",
        confirmation: "原来是那次彻夜长谈时吹过的晚风……"
    },
    { 
        symbol: "阁楼一角", 
        description: "堆满杂物的阁楼一角",
        theme: "在尘封的记忆中，找回被遗忘的童年约定与宝藏",
        confirmation: "原来是那个藏在旧箱子底的秘密……"
    },
    { 
        symbol: "清晨公园", 
        description: "晨雾弥漫的公园长椅",
        theme: "在日复一日的平淡中，发现被忽略的陪伴与默默的守护",
        confirmation: "原来是那个每天清晨都在等候的身影……"
    },
];

const SceneChoiceScreen = ({ onSceneSelect }: { onSceneSelect: (scene: SceneData) => void }) => {
    
    const choices = useMemo(() => {
        const shuffled = [...ALL_SCENES].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 4);
    }, []);

    const [selected, setSelected] = useState<number | null>(null);
    const [fading, setFading] = useState(false);

    const handleSelect = (index: number) => {
        setSelected(index);
        setFading(true);
        setTimeout(() => {
            onSceneSelect(choices[index]);
        }, 1500);
    };

    return (
        <div className={`bg-slate-900 text-white font-serif h-screen w-screen flex flex-col justify-center items-center p-8 transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}>
            <h2 className="text-3xl max-w-3xl text-center leading-relaxed mb-12 animate-fade-in">在内心最安静的角落，是哪个场景在悄然回响？</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {choices.map((choice, index) => (
                     <div 
                        key={index} 
                        className="flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all duration-300 hover:bg-slate-700/50 animate-fade-in"
                        style={{ animationDelay: `${100 * (index + 1)}ms` }}
                        onClick={() => handleSelect(index)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSelect(index); }}
                        aria-label={choice.description}
                     >
                        <span className="text-5xl mb-4 text-cyan-200" style={{fontFamily: 'serif'}}>{choice.symbol}</span>
                        <span className="text-lg text-center">{choice.description}</span>
                    </div>
                ))}
            </div>
            {selected !== null && (
                 <p className="mt-12 text-2xl text-gray-300 animate-fade-in">{choices[selected].confirmation}</p>
            )}
        </div>
    );
};

const charactersByScene: Record<string, { role: string; description: string }[]> = {
    "空荡荡的课后教室": [
        { role: "严厉的老师", description: "他的期望是一座无法翻越的山。" },
        { role: "沉默的同桌", description: "你们的交流只剩下笔尖的沙沙声。" },
        { role: "缺席的父母", description: "他们总是在更重要的地方忙碌。" },
        { role: "过去的自己", description: "那个总想考一百分的孩子。" }
    ],
    "堆满杂物的阁楼一角": [
        { role: "青梅竹马的玩伴", description: "那个说好一起长大的约定还算数吗？" },
        { role: "温柔的祖父母", description: "他们的背影是整个童年的依靠。" },
        { role: "弄堂里的旧街坊", description: "如今只剩下模糊的问候。" },
        { role: "孤独的自己", description: "那个总是一个人玩耍的孩子。" }
    ],
    "蒙尘的书店角落": [
        { role: "博学的店主", description: "他总能推荐一本看透你心事的书。" },
        { role: "疏远的兄弟姐妹", description: "你们曾分享同一个书架，如今却无话可说。" },
        { role: "严格的父亲", description: "他希望你读“有用”的书，而不是“闲书”。" },
        { role: "迷茫的自己", description: "那个在书堆里寻找答案的孩子。" }
    ],
    "空无一人的旧车站台": [
        { role: "曾经的恋人", description: "故事的结局，和电影里演的不一样。" },
        { role: "最好的朋友", description: "不知从何时起，你们开始乘坐不同的列车。" },
        { role: "送你远行的亲人", description: "他/她的叮嘱还在耳边回响。" },
        { role: "憧憬远方的自己", description: "那个以为远方就是一切的孩子。" }
    ],
    "只亮着一盏灯的深夜厨房": [
        { role: "晚归的家人", description: "他/她总是带着一身疲惫回家。" },
        { role: "早起的母亲", description: "她的爱都藏在清晨的早餐里。" },
        { role: "笨拙学做菜的自己", description: "第一次做饭是为了给谁惊喜？" },
        { role: "童年时的外婆", description: "她的厨房里总有变不完的戏法。" }
    ],
    "寂静无声的医院长廊": [
        { role: "疲惫的医生", description: "他/她见证了太多的离别与新生。" },
        { role: "焦虑的家属", description: "在长廊尽头，祈祷是唯一能做的事。" },
        { role: "同病房的陌生人", description: "你们因为命运短暂地交汇。" },
        { role: "无能为力的自己", description: "那个第一次体会到生命脆弱的孩子。" }
    ],
    "能看到城市夜景的屋顶天台": [
        { role: "一起逃课的同学", description: "你们分享着对未来的迷茫和憧憬。" },
        { role: "沉默寡言的兄长", description: "他用行动代替了所有不善表达的关心。" },
        { role: "鼓励你的老师", description: "他/她让你看到了自己的另一种可能。" },
        { role: "对未来迷茫的自己", description: "那个对着星空许愿的孩子。" }
    ],
    "晨雾弥漫的公园长椅": [
        { role: "一起晨练的邻居", description: "你们的问候是这座城市最早的声音。" },
        { role: "严格的父亲", description: "他逼你早起，是希望你更早看到世界。" },
        { role: "公园里下棋的老人", description: "他们的棋盘里藏着人生的智慧。" },
        { role: "被要求早起的自己", description: "那个睡眼惺忪却看到日出的孩子。" }
    ],
};

const CharacterChoiceScreen = ({ scene, onCharacterSelect }: { scene: SceneData, onCharacterSelect: (character: { role: string; description: string; }) => void }) => {
    const characters = charactersByScene[scene.description] || [];
    const [fading, setFading] = useState(false);

    const handleSelect = (character: { role: string; description: string; }) => {
        setFading(true);
        setTimeout(() => {
            onCharacterSelect(character);
        }, 500);
    };

    return (
        <div className={`bg-slate-900 text-white font-serif h-screen w-screen flex flex-col justify-center items-center p-8 transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}>
            <h2 className="text-3xl max-w-3xl text-center leading-relaxed mb-4 animate-fade-in">在 <span className="text-cyan-200">{scene.description}</span> 的记忆里，</h2>
            <h2 className="text-3xl max-w-3xl text-center leading-relaxed mb-12 animate-fade-in">你最想理解谁？</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {characters.map((char, index) => (
                     <div 
                        key={index} 
                        className="flex flex-col items-center p-6 rounded-lg cursor-pointer transition-all duration-300 hover:bg-slate-700/50 animate-fade-in border border-slate-700"
                        style={{ animationDelay: `${100 * (index + 1)}ms` }}
                        onClick={() => handleSelect(char)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSelect(char); }}
                        aria-label={char.role}
                     >
                        <span className="text-3xl mb-4">{char.role}</span>
                        <span className="text-md text-center text-gray-400">{char.description}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const GeneratingScreen = ({ message, error }: { message: string, error: string | null }) => (
    <div className="bg-slate-900 text-white font-serif h-screen w-screen flex flex-col justify-center items-center p-8">
        <div className="flex items-center text-2xl">
            { !error && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <p className="animate-pulse">{message}</p>
        </div>
        {error && (
            <div className="mt-4 text-red-400 text-center">
                <p>生成失败：</p>
                <p className="text-sm mt-2 max-w-xl">{error}</p>
                 <button 
                    onClick={() => window.location.reload()}
                    className="mt-8 px-6 py-2 border border-white rounded hover:bg-white hover:text-black transition-colors"
                >
                    重试
                </button>
            </div>
        )}
    </div>
);


const Desktop = ({ gameData, onGameEnd }: { gameData: GameData, onGameEnd: (results: InteractionResults) => void }) => {
    const [activeWindow, setActiveWindow] = useState<IconKey | null>(null);
    const [allContent, setAllContent] = useState(gameData.initialContentData);
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
            setInventory(prev => [...prev, ...gameData.initialPlainItems[icon]]);
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

        const interaction = gameData.interactionEffects.find(item => item.name === droppedItem.name);
        const effect = interaction?.effects[target];
        
        if (effect) {
            setAllContent(prev => ({
                ...prev,
                [target]: { ...prev[target], content: effect.change }
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
            const recipe = gameData.recipesList.find(r => {
                const sortedRecipeItems = [r.item1, r.item2].sort();
                return sortedRecipeItems[0] === sortedNames[0] && sortedRecipeItems[1] === sortedNames[1];
            });

            if (recipe) {
                setSynthesisSlots([null, null]);
                const resultName = recipe.result;
                const newItem: Item = { id: `sacred-${Date.now()}`, name: resultName, type: 'sacred' };
                setInventory(prev => [...prev, newItem]);
            } else {
                // Handle failed synthesis
                setShowFailToast(count => count + 1);

                const docsInitialItemNames = gameData.initialPlainItems.docs.map(i => i.name);
                const isEarlyDocsFailure = docsInitialItemNames.includes(item1.name) && docsInitialItemNames.includes(item2.name);

                // **FIXED LOGIC**: This is the specific, intended failure path for the 'Lost Compass' ending.
                if (isEarlyDocsFailure) {
                    // This combination is a designed failure. Trigger the ending directly.
                    // Do not return items to inventory, leave them as a clue.
                    setTimeout(() => {
                        onGameEnd({ docs: 'no-heal' });
                    }, 1500);
                    return; // End execution here to prevent falling through to other logic.
                }
                
                // Check for a "dead end" state later in the game.
                const isDeadEnd = 
                    interactedWindows.size === 2 &&
                    inventory.length === 0 &&
                    item1.type === 'plain' &&
                    item2.type === 'plain';

                if (isDeadEnd) {
                    const allIcons: IconKey[] = ['docs', 'network', 'recycle'];
                    const remainingIcon = allIcons.find(icon => !interactedWindows.has(icon));
                    
                    if (remainingIcon) {
                        const finalResults = { ...interactionResults, [remainingIcon]: 'no-heal' as const };
                        setTimeout(() => {
                             onGameEnd(finalResults);
                        }, 1500);
                        return; // Prevent items from being returned to inventory.
                    }
                }

                // For all other non-critical failures, return items to inventory after a short delay.
                setTimeout(() => {
                    setSynthesisSlots([null, null]);
                    setInventory(prev => [...prev, item1, item2]);
                }, 500);
            }
        }
    }, [synthesisSlots, gameData, onGameEnd, inventory, interactionResults, interactedWindows]);


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
                        <DesktopIcon icon={<MyDocumentsIcon />} name={allContent.docs.title} onDoubleClick={() => handleOpen('docs')} />
                    </IconWrapper>
                    <IconWrapper target="network">
                        <DesktopIcon icon={<NetworkNeighborhoodIcon />} name={allContent.network.title} onDoubleClick={() => handleOpen('network')} locked={iconLocks.network} />
                    </IconWrapper>
                    <IconWrapper target="recycle">
                        <DesktopIcon icon={<RecycleBinIcon />} name={allContent.recycle.title} onDoubleClick={() => handleOpen('recycle')} locked={iconLocks.recycle} />
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

// --- AI Generation Schema and Logic ---

const masterPromptSchema = {
    type: Type.OBJECT,
    properties: {
        initialContentData: {
            type: Type.OBJECT,
            properties: {
                docs: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, content: { type: Type.STRING } }, required: ["title", "content"] },
                network: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, content: { type: Type.STRING } }, required: ["title", "content"] },
                recycle: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, content: { type: Type.STRING } }, required: ["title", "content"] },
            },
            required: ["docs", "network", "recycle"]
        },
        initialPlainItems: {
            type: Type.OBJECT,
            properties: {
                docs: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, type: { type: Type.STRING, enum: ['plain'] } }, required: ["id", "name", "type"] } },
                network: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, type: { type: Type.STRING, enum: ['plain'] } }, required: ["id", "name", "type"] } },
                recycle: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, name: {  type: Type.STRING }, type: { type: Type.STRING, enum: ['plain'] } }, required: ["id", "name", "type"] } },
            },
            required: ["docs", "network", "recycle"]
        },
        recipesList: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    item1: { type: Type.STRING, description: "The name of the first ingredient item." },
                    item2: { type: Type.STRING, description: "The name of the second ingredient item." },
                    result: { type: Type.STRING, description: "The name of the resulting sacred item." },
                },
                required: ["item1", "item2", "result"]
            }
        },
        interactionEffects: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the 'sacred' item this effect applies to. Must match a result from recipesList." },
                    effects: {
                        type: Type.OBJECT,
                        properties: {
                            docs: { type: Type.OBJECT, properties: { type: { type: Type.STRING, enum: ['heal', 'no-heal'] }, change: { type: Type.STRING, description: "Narrative text describing the change." } }, required: ["type", "change"] },
                            network: { type: Type.OBJECT, properties: { type: { type: Type.STRING, enum: ['heal', 'no-heal'] }, change: { type: Type.STRING } }, required: ["type", "change"] },
                            recycle: { type: Type.OBJECT, properties: { type: { type: Type.STRING, enum: ['heal', 'no-heal'] }, change: { type: Type.STRING } }, required: ["type", "change"] },
                        },
                        required: ["docs", "network", "recycle"]
                    }
                },
                required: ["name", "effects"]
            }
        },
        endings: {
            type: Type.OBJECT,
            properties: {
                compass: { type: Type.OBJECT, properties: { description: { type: Type.STRING } }, required: ["description"] },
                bridge: { type: Type.OBJECT, properties: { description: { type: Type.STRING } }, required: ["description"] },
                lie: { type: Type.OBJECT, properties: { description: { type: Type.STRING } }, required: ["description"] },
                worlds: { type: Type.OBJECT, properties: { description: { type: Type.STRING } }, required: ["description"] },
                dinner: { type: Type.OBJECT, properties: { description: { type: Type.STRING } }, required: ["description"] },
            },
            required: ["compass", "bridge", "lie", "worlds", "dinner"]
        }
    },
    required: ["initialContentData", "initialPlainItems", "recipesList", "interactionEffects", "endings"]
};

// --- Main App Component ---

const App = () => {
    type Stage = 'boot' | 'quote' | 'choice' | 'characterChoice' | 'generating' | 'desktop' | 'ending';
    const [stage, setStage] = useState<Stage>('boot');
    const [selectedScene, setSelectedScene] = useState<SceneData | null>(null);
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [genError, setGenError] = useState<string | null>(null);
    const [endingResult, setEndingResult] = useState<Ending | null>(null);
    const [genMessage, setGenMessage] = useState('正在连接到核心记忆...');

    const generateGameData = useCallback(async (scene: SceneData, character: { role: string }) => {
        setStage('generating');
        try {
            setGenMessage(scene.confirmation);
            await new Promise(resolve => setTimeout(resolve, 1500));
            setGenMessage(`正在进入与 ${character.role} 的共同记忆...`);

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const prompt = `你是一位情感细腻的创意游戏设计师，为一款关于回忆、成长和亲情的象征性解谜游戏生成核心数据。

**核心故事背景：**
*   **场景选择：** 玩家选择了充满象征意义的场景：“${scene.description}”。
*   **人物选择：** 在这个场景中，玩家选择深入探索与“${character.role}”的关系。
*   **核心主题：** 整个故事将围绕“${scene.theme}”，并通过玩家与“${character.role}”的互动来展现。

你的核心任务是基于以上【场景】和【人物】，创作一个连贯、动人、逻辑自洽的故事。故事通过一台旧电脑的三个核心图标展开：
*   **“我的文档”：** 代表【我】（玩家）的故事和视角。
*   **“网上邻居”：** 代表【对方】（${character.role}）的故事和视角。
*   **“回收站”：** 代表【我们共同的】被遗忘或被误解的关键记忆/真相。

请严格遵循以下三步和Schema，生成一套完整的JSON格式游戏数据。所有生成的文本内容（道具名称、图标标题、文本框内容、结局描述等）都必须是【中文】，并且必须与所选的场景和人物关系紧密相关，形成一个统一的叙事体验。

---
**第一步：创建故事文本与道具**

1.  **图标内容 (\`initialContentData\`)**
    *   **\`docs.title\`**: 必须是 "我的文档"。
    *   **\`docs.content\`**: 撰写一段从【我】的视角出发的文本，表达在“${scene.description}”这个场景下，我对“${character.role}”的感受、困惑或回忆。
    *   **\`network.title\`**: 必须是人物的角色名：“${character.role}”。
    *   **\`network.content\`**: 撰写一段从【${character.role}】的视角出发的文本，表达在同一场景下，Ta的想法、苦衷或期望。
    *   **\`recycle.title\`**: 必须是 "回收站"。
    *   **\`recycle.content\`**: 撰写一段揭示【共同真相】的文本，这段记忆是理解双方关系的关键。

2.  **初始道具分配 (\`initialPlainItems\`)**
    *   为“我的文档”创建 **整整三个（3个）** 与【我】的视角和故事相关的“普通道具”。
    *   为“网上邻居”创建 **整整三个（3个）** 与【${character.role}】的视角和故事相关的“普通道具”。
    *   “回收站”**必须为空**。
    *   所有6个道具的名称必须是唯一的，且与“${scene.description}”和人物故事高度相关。
    *   为每个道具分配唯一的字符串ID（例如，'plain-1'）。

3.  **合成配方 (\`recipesList\`)**
    *   6个初始道具，总共有15种独特的两两组合。
    *   你必须设计配方，使得总共有 **1到8个** 组合是“无法合成”的。这意味着你将创造7到14个“神圣道具”。
    *   **【关键游戏逻辑】：“我的文档”文件夹内的3个道具，它们之间有3种组合方式。你必须设计成【其中1种组合无法合成，另外2种可以合成】。这是为了保证玩家在游戏初期就可能失败，从而达成特定结局。**
    *   **游戏可玩性保证：** 你必须确保，玩家仅用“我的文档”中的道具，至少可以合成一个能够“治愈”（heal）“我的文档”的神圣道具。
    *   规划完毕后，生成只包含有效、可合成组合的 \`recipesList\` JSON数组。

---
**第二步：定义交互效果**

1.  为你创造的 **每一个“神圣道具”**，其名称和交互效果都必须深刻地反映出【我】与【${character.role}】之间关系的某种变化或理解。
2.  每个交互都有一个 \`type\`（'heal' 或 'no-heal'）和一个 \`change\`（用于更新文本框的叙事文本，必须包含<s>旧文本</s><new>新文本</new>这样的标签来展示变化）。
3.  **关键解锁机制：** 为了解锁 'network' 和 'recycle'，玩家必须使用一个对 'docs' 有 "heal" 效果的神圣道具。因此，**你必须确保在“我的文档”的道具所能合成的神圣道具中，至少有一个对'docs'图标有"heal"效果。**

---
**第三步：撰写结局描述**
1.  游戏有5个固定的结局和达成条件。你的任务是为每一个结局撰写一段引人入胜的、与玩家在“${scene.description}”场景中同“${character.role}”的故事紧密相连的中文\`description\`。结局的JSON key必须是 'compass', 'bridge', 'lie', 'worlds', 'dinner'。

*   **结局1 (\`compass\`)**: 
    *   **标题**: 《迷失的罗盘》
    *   **达成条件**: “我的文档”治愈失败。
    *   **任务**: 撰写描述，关于未能解决最初的内心矛盾。
*   **结局2 (\`bridge\`)**: 
    *   **标题**: 《心与心的桥梁》
    *   **达成条件**: 成功治愈“我的文档”、“网上邻居”、“回收站”。
    *   **任务**: 撰写描述，关于完全的和解与相互理解。
*   **结局3 (\`lie\`)**: 
    *   **标题**: 《心照不宣的谎言》
    *   **达成条件**: 成功治愈“我的文档”和“回收站”，但未治愈“网上邻居”。
    *   **任务**: 撰写描述，关于一种没有真正理解对方的表面和解。
*   **结局4 (\`worlds\`)**: 
    *   **标题**: 《各自的世界》
    *   **达成条件**: 成功治愈“我的文档”和“网上邻居”，但未治愈“回收站”。
    *   **任务**: 撰写描述，关于理解了彼此但未能有效沟通，导致一种平静但孤独的疏离。
*   **结局5 (\`dinner\`)**: 
    *   **标题**: 《破碎的家庭晚餐》
    *   **达成条件**: 成功治愈“我的文档”，但在“网上邻居”和“回收站”中失败。
    *   **任务**: 撰写描述，关于实现了自我认知，但完全无法与他人建立连接，导致彻底的沟通崩溃。
`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: masterPromptSchema,
                },
            });
            
            const jsonStr = response.text.trim();
            const data = JSON.parse(jsonStr) as GameData;
            setGameData(data);
            setStage('desktop');

        } catch (e: any) {
            console.error(e);
            setGenError(e.message || "An unknown error occurred during generation.");
        }
    }, []);

    const handleSceneSelect = (scene: SceneData) => {
        setSelectedScene(scene);
        setStage('characterChoice');
    };

    const handleCharacterSelect = (character: { role: string; description: string; }) => {
        if (selectedScene) {
            generateGameData(selectedScene, character);
        }
    };

    const handleGameEnd = useCallback((results: InteractionResults) => {
        if (gameData) {
            const finalEnding = determineEnding(results, gameData.endings);
            setEndingResult(finalEnding);
            setStage('ending');
        }
    }, [gameData]);

    const handleRestart = () => {
        setGameData(null);
        setEndingResult(null);
        setGenError(null);
        setSelectedScene(null);
        setStage('choice'); 
    };

    switch (stage) {
        case 'boot':
            return <BootScreen onBootComplete={() => setStage('quote')} />;
        case 'quote':
            return <BenjaminQuote onContinue={() => setStage('choice')} />;
        case 'choice':
            return <SceneChoiceScreen onSceneSelect={handleSceneSelect} />;
        case 'characterChoice':
            return selectedScene ? <CharacterChoiceScreen scene={selectedScene} onCharacterSelect={handleCharacterSelect} /> : <GeneratingScreen message="加载场景时出错..." error="Scene data is null." />;
        case 'generating':
            return <GeneratingScreen message={genMessage} error={genError} />;
        case 'desktop':
            return gameData ? <Desktop gameData={gameData} onGameEnd={handleGameEnd} /> : <GeneratingScreen message="加载游戏数据时出错..." error="Game data is null." />;
        case 'ending':
            return endingResult ? <EndingScreen title={endingResult.title} description={endingResult.description} onRestart={handleRestart} /> : <GeneratingScreen message="加载结局时出错..." error="Ending result is null." />;
        default:
            return <BootScreen onBootComplete={() => setStage('quote')} />;
    }
};

export default App;
