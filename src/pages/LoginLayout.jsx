import React, { useRef, useState } from 'react'
import { Button, Label, TextInput, Spinner } from 'flowbite-react';
import axios from 'axios';

function LoginLayout() {

    /** rules array */
    const rules = [
        { id:"1", type:"title", message:"遊戲說明" },
        { id:"2", type:"subtitle", message:"剪刀石頭布，簡單對決，智慧與運氣的巧妙交鋒。來體驗吧，歡樂無窮！" },
        { id:"3", type:"", message:"● 經典剪刀石頭布，大家熟悉的童年遊戲" },
        { id:"4", type:"", message:"● 玩家輪流出拳，簡單明瞭，歡笑不斷" },
        { id:"5", type:"", message:"● 超趣挑戰！同時出兩拳，制定策略勝利" },
        { id:"6", type:"", message:"● 剪刀剪布，布包住石頭，石頭砸剪刀" },
        { id:"7", type:"", message:"● 贏家根據規則獲勝" }
    ];

    /** loading flag 狀態 */
    let [loadFlag, setLoadFlag] = useState({
        checkName:false,
        login:false
    });

    /** 名稱 Input Dom 參考 */
    const nameInpElement = useRef(null);

    /** [ API ]-檢查用戶名
     *  檢查用戶名是否已被使用。
     *  @param { object } 用戶名 dom 參考
     */
    const checkNameClick = async () => {
        const username = nameInpElement.current.value;

        /** user username check */
        if( !username ){
            alert("請輸入您角色名稱");
            return
        }
        try{
            const API_URL = `${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/user/${username}`;

            /** 確認用戶檢查按鈕顯示加載中 */
            setLoadFlag({
                ...loadFlag, checkName:true
            })

            /** check username is used or not */
            let result = await axios.get(API_URL);

            let { data, message } = result;

            /** 在線人物表有發現該暱正在被使用 */
            if( data.status )
                throw new Error( message );

            /** 確認用戶檢查按鈕加載中顯示取消 */
            setLoadFlag({
                ...loadFlag, checkName:false
            })
            /** 在線人物表中無該人物 */
            alert( message );

        }catch(error){
            /** 確認用戶檢查按鈕加載中顯示取消 */
            setLoadFlag({
                ...loadFlag, checkName:false
            })
            /** Log recording */
            alert( error.message );
        }
    }

    /** [ API ]-登入功能
     * 檢查用戶名是否已被使用，生成 jwt 令牌身分保存。
     * @param { object } 用戶名 dom 參考
     */
    const loginClick = async () => {
        let username = nameInpElement.current.value;
        
        if( !username )
        {
            alert("請輸入您角色名稱");
            return
        }
        try{
            const API_URL = `${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/login`;

            /** 登入按鈕顯示加載中 */
            setLoadFlag({
                ...loadFlag, login:true
            })

            let result = await axios.post(API_URL, {username});
            
            if( result )
            {
                let { username, token } = result.data;

                /** save token and username */
                window.localStorage.setItem('token', token);
                window.localStorage.setItem('username', username);

                /** 登入按鈕加載中顯示取消 */
                setLoadFlag({
                    ...loadFlag, login:false
                })

                /** redire to charactor pick page */

            }
        }catch(error){
            /** 登入按鈕加載中顯示取消 */
            setLoadFlag({
                ...loadFlag, login:false
            })
            /** Log recording */
            alert( error.message );
        }
        
        
    }

  return (
    <>
        <div className="w-full h-screen bg-blue-100 flex justify-center items-center py-14 px-20">
            <div className="flex md:justify-between rounded-lg bg-white w-full max-w-5xl h-full">
                { /** login Form */ }
                <form action={`/charactor-picker`} className="md:px-14 md:py-[65px] px-6 py-8 flex flex-col justify-between w-full">
                    <div className="w-full">
                        <header className="font-black text-3xl text-center pb-5 tracking-wide">Login</header>
                        <div className="mb-4 mt-10">
                            <Label
                                className="text-gray-500"
                                htmlFor="username"
                                value="角色暱稱"
                            />
                            <TextInput
                                className="mb-4"
                                id="email1" 
                                placeholder="請輸入您的角色暱稱"
                                required
                                type="text"
                                ref={nameInpElement}
                                disabled={
                                    (loadFlag.checkName || loadFlag.login)
                                }
                            />
                            <div className="flex items-center flex-row-reverse">  
                                <a href="" className="ml-3 text-sm text-gray-400 underline hover:text-gray-700 cursor-pointer md:hidden">了解遊戲規則</a>
                                <Button 
                                    pill 
                                    size="xs"
                                    className="bg-blue-500 font-semibold tracking-wider duration-200"
                                    onClick={checkNameClick}
                                    disabled={
                                        (loadFlag.checkName || loadFlag.login)
                                    }
                                    >
                                    用戶檢查
                                    { (loadFlag.checkName) ? (
                                        <Spinner
                                            className="ml-1"
                                            aria-label="Spinner button example"
                                            size="sm"
                                        />) : ""
                                    } 
                                </Button> 
                            </div>
                            
                        </div>
                    </div>
                    <Button 
                        className="text-md font-bold mb-10 duration-200"
                        color="blue"
                        type="button"
                        onClick={loginClick}
                        disabled={
                            (loadFlag.checkName || loadFlag.login)
                        }
                    >
                    送出
                    { 
                        (loadFlag.login) ? (
                                    <Spinner
                                        className="ml-1"
                                        aria-label="Spinner button example"
                                        size="sm"
                                    />) : ""
                                }
                    </Button>

                </form>

                {/** div for game rule */}
                <div className="md:flex px-14 py-[65px] flex-col bg-purple-900 w-full rounded-r-lg hidden">
                    { 
                        rules.map( item => {
                            return ( item.type === "title" ) 
                                        ? <h1 key={item.id} className="text-3xl font-bold text-white mb-6 tracking-wider">{item.message}</h1>
                                        : ( item.type === "subtitle" )
                                            ? <h2 key={item.id} className="text-lg font-semibold text-white mb-10">{item.message}</h2>
                                            : <h3 key={item.id} className="text-base text-white mb-3">{item.message}</h3>
                        })
                    }
                </div>
            </div>
        </div>
    </>
  )
}

export default LoginLayout