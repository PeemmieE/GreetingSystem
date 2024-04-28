import React, { useState, useEffect } from 'react'
import axios from 'axios'



export default function NewShow() {
    const [data, setData] = useState([])
    useEffect(() => {
        const testFunc = async () => {
            const res = await axios.get(import.meta.env.VITE_API + '/getEmployee')
            console.log(res.data)
            setData(res.data)
        }
        testFunc()

    }, [])
    const testclick = ()=>{
        console.log(data)
    }
    const searchname = async () =>{
        let nametest = document.getElementById('name').value
        console.log(nametest)
        let url = new URL(import.meta.env.VITE_API + '/getEmployee')
        url.searchParams.append('name',nametest)
        const res = await axios.get(url.toString())

        console.log(res.data)
        setData(res.data)
    }
    return (
        <>
            <div>
                {/* <button onClick={testclick}>????</button> */}
                <input id='name' type='text'/>
                <button onClick={searchname}>search</button>
                <table style={{border:'1px solid black'}}>
                    <thead>
                        <tr>
                            <td>Name</td>
                            <td>Action</td>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((dataa, key) => (
                            <tr key={key}>
                                <td>{dataa.employee_name}</td>
                                <button>gotoEMP</button>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}
