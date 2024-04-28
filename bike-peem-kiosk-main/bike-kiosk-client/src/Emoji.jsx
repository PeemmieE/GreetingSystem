import React from 'react'

import neutral from './emotionImage/neutral.jpg';
import happy from './emotionImage/happy.jpg';
import sad from './emotionImage/angry.jpg';
import angry from './emotionImage/angry.jpg';
import disgusted from './emotionImage/disgusted.jpg';
import fearful from './emotionImage/fearful.jpg';
import surprised from './emotionImage/surprised.jpg'

export const emoji = (expression) => {
    if (expression === 'neutral') {
        return (
            <img className='w-12 h-12 rounded-xl' src={neutral}></img>
        );
    }
    else if (expression === 'happy') {
        return (
            <img className='w-12 h-12 rounded-xl' src={happy}></img>
        );
    }
    else if (expression === 'sad') {
        return (
            <img className='w-12 h-12 rounded-xl' src={sad}></img>
        );
    }
    else if (expression === 'angry') {
        return (
            <img className='w-12 h-12 rounded-xl' src={angry}></img>
        );
    }
    else if (expression === 'disgusted') {
        return (
            <img className='w-12 h-12 rounded-xl' src={disgusted}></img>
        );
    }
    else if (expression === 'fearful') {
        return (
            <img className='w-12 h-12 rounded-xl' src={fearful}></img>
        );
    }
    else if (expression === 'surprised') {
        return (
            <img className='w-12 h-12 rounded-xl' src={surprised}></img>
        );
    }

    return null;
};

