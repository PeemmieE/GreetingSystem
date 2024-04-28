import React, { useState, useEffect } from 'react';
import { emoji } from './Emoji';

let timeoutID;

function Greeting({ propData }) {
    const [faceData, setFaceData] = useState([]);
    const [displayData, setDisplayData] = useState([]);

    const convertToBase64 = (binaryData) => {
        const base64 = btoa(String.fromCharCode(...new Uint8Array(binaryData)));
        return `data:image/png;base64,${base64}`;
    };

    const showPopUp = async () => {
        if (propData.length === 0) {
            return;
        }

        clearTimeout(timeoutID);

        const convertedData = propData.map(data => ({
            ...data,
            singleFace: convertToBase64(data.singleFace.data),
        }));

        setFaceData(convertedData);
        setDisplayData(convertedData.slice(0, 5));

        timeoutID = setTimeout(() => {
            setDisplayData(convertedData);
        }, 1000);

        setTimeout(() => {
            setFaceData([]);
            setDisplayData([]);
        }, 30000);
    };

    const greeting = async () => {
        if (propData.length === 0) {
            return;
        }
        console.log('call greeting function');

        const getVoices = () => new Promise(resolve => {
            const voices = speechSynthesis.getVoices();
            if (voices.length) {
                resolve(voices);
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    resolve(speechSynthesis.getVoices());
                };
            }
        });

        const voices = await getVoices();

        propData.forEach(data => {
            const label = data.name.replace(/\s+/g, '');
            const utterance = new SpeechSynthesisUtterance(`สวัสดี${label}${data.greeting}`);
            utterance.voice = voices.find(v => v.name.includes('Microsoft Pattara')) || null;
            utterance.rate = 1.1;
            speechSynthesis.speak(utterance);
        });
    };

    useEffect(() => {
        showPopUp();
        greeting();
    }, [propData]);

    return (
        <>
            {displayData.length > 0 ? (
                <div className='flex justify-center items-start z-20 absolute inset-x-0 bottom-0 overflow-auto'>
                    {displayData.map((data, index) => (
                        <div className='relative grid grid-cols-3 items-center p-2 rounded-xl shadow-lg' key={index} style={{ margin: '10px', border: '1px solid #eaeaea', borderRadius: '15px' }}>
                            <div className='absolute inset-0 bg-white opacity-75 rounded-xl'></div>
                            <div className='relative z-10'>
                                <img alt="Face" className='col-span-1 w-16 h-16 md:w-16 md:h-16 rounded-full border-2 border-gray-300' src={data.singleFace} />
                            </div>
                            <div className='col-start-2 col-span-2 flex flex-col ml-1 justify-start relative z-10'>
                                <div className='font-mono text-sm'>
                                    <span className='font-bold'>{data.name}</span>
                                </div>
                            </div>
                            <div className='col-span-4 flex items-center justify-between pr-2 relative z-10'>
                                <div className='text-gray-600 pr-1'>{data.greeting}</div>
                                <div>{emoji(data.expression)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='flex items-center justify-center h-full'>Empty</div>
            )}
        </>
    );
}

export default Greeting;