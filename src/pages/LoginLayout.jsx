import React, { useRef } from 'react'
import { Button, Label, TextInput } from 'flowbite-react';

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

    /** 名稱 Input Dom 參考 */
    const nameInpElement = useRef(null);

    /**
     *  [ API ]-檢查用戶名是否被占用
     *  檢查用戶名是否占用。
     *  @param { object } 用戶名 dom 參考
     */
    const checkNameClick = () => {
        const name = nameInpElement.current.value;
        
        /** user name check */
        if( !name ){
            alert("請輸入您角色名稱");
            return
        }
    }

    /**
     * [ API ]-登入功能
     * 檢查用戶名是否占用，生成 jwt 令牌身分保存。
     * @param { object } 用戶名 dom 參考
     */
    const loginClick = () => {
        let name = nameInpElement.current.value;
        
        if( !name )
        {
            alert("請輸入您角色名稱");
            return
        }
    }

  return (
    <>
        <div className="w-full h-screen bg-blue-100 flex justify-center items-center py-10 px-20">
            <div className="flex md:justify-between rounded-md bg-white w-full h-full">
                { /** login Form */ }
                <form action="" className="md:px-14 md:py-[65px] px-6 py-8 flex flex-col justify-between w-full">
                    <div className="w-full">
                        <header className="font-black text-3xl text-center pb-5 tracking-wide">Login</header>
                        <div className="mb-4">
                            <Label
                                className="text-gray-500"
                                htmlFor="charactor-name"
                                value="角色暱稱"
                            />
                            <TextInput
                                className="mb-4"
                                id="email1" 
                                placeholder="請輸入您的角色暱稱"
                                required
                                type="email"
                                ref={nameInpElement}
                            />
                            <div className="flex items-center flex-row-reverse">  
                                <a href="" className="ml-3 text-sm text-gray-400 underline hover:text-gray-700 cursor-pointer md:hidden">了解遊戲規則</a>
                                <Button 
                                    pill 
                                    size="xs"
                                    className="bg-blue-500 font-semibold tracking-wider"
                                    onClick={checkNameClick}
                                    >
                                    用戶檢查
                                </Button> 
                            </div>
                            
                        </div>
                    </div>
                    <Button 
                        className="text-md font-bold"
                        color="blue"
                        onClick={loginClick}
                    >
                        送出
                    </Button>

                </form>

                {/** div for game rule */}
                <div className="md:flex px-14 py-[65px] flex-col bg-purple-900 w-full hidden">
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