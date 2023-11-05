import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Button } from 'flowbite-react';
import { HiCheck } from 'react-icons/hi'

import profile from '../asset/avatar/profile.png';
import trophy from '../asset/icons/trophy.png';
import flag from '../asset/icons/flag.png';

function MainLayout({ socket }) {

  const location = useLocation();
  /** [REACT FUNCTION] navigate */
  const navigate = useNavigate();
  /** [REACT FUNCTION]-遊戲狀態 */
  let [game, setGame] = useState({
    id: socket.id,
    username: location.state.username,
    result: 0, // 0 -> 未選擇猜拳狀態
    roomId: location.state.roomId,
    round: 0,
    memberList: location.state.memberList
  });

  /** [REACT FUNCTION]-按鈕狀態 */
  let [btnStates, setBtnStates] = useState(
      { 
        btnSubmit: false,
        btnRock: false,
        btnScissors: false,
        btnPaper: false
      }
    );

  /** [REACT FUNCTION]-Game State Effect */
  useEffect( () => {

    /** 勝負檢測 */
    
    /** 猜拳失敗邏輯 */
    if( game.result === 4 )
    {
      alert('猜拳失敗請再加油!!');
      navigate('/pick');
    }

    /** 勝者邏輯 */
    let final = true;
    for( let item of game.memberList )
    {
      if( item.id !== game.id && item.result !== 4 )
      {
        final = false;
        break
      }
    }
    console.log('final', final);

    if( final )
    {
      alert('恭喜你為最終贏家');
      navigate('/pick');
    }

    /** 按下決定才開始 */
    if( btnStates.btnSubmit ){

      /** 檢查客戶端猜拳狀態 */
      let resultCheck = checkClientResult();

      /** 所有客戶端準備好且自己非已輸狀態 */
      if( resultCheck && game.result !== 4 )
      {
        handleGameResult();
      }
    }  

    /** Socket 監聽事件 */

    /** 接收其他客戶端的猜拳狀態變化 */
    socket.on('resultResponse', (data) => {
      let { id, result } = data;

      if( !id || result === 0 )
      {
        alert('[Socket Error-resultResponse] 參數錯誤');
        return;
      }

      let _memberList = game.memberList.map( member => ( member.id === id ) ? { ...member, result } : member );

      /** 更改該客戶端狀態 */
      setGame({...game, memberList:_memberList});
    })

  }, [game, btnStates.btnSubmit]);

  /** [ACTION]-檢查所有客戶端是否已準備 
   * @returns { Boolean } true -> 所有客戶端已準備， falese -> 有客戶端尚未準備
  */
  let checkClientResult = () => {

    /** 客戶端列表需要有值，需要有遊玩對象且自己需選擇完畢 */
    if( game.memberList.length === 0 || game.result === 0 )
      return false;

    for( let member of game.memberList )
    {
      if( member.result === 0 && member.id !== game.id )
        return false;
    }

    return true;
  }

  /** [ACTION]-和局檢查
   * 只接受可繼續遊玩的客戶端，result = 4( 狀態已輸 )，無法進行遊玩。
   * @param {Array} resultList 所有還可進行遊戲參賽者的結果陣列
   * @return {Boolean} false -> 非和局，true-> 和局 
  */
  let checkIsTie = (resultList) => {
    if( resultList.length < 1 )
    {
      alert( `[FUNCTION ERROR-checkIsTie] 陣列數小於 1，無法進行比較, data:${resultList}` );
      return true;
    }
    let ArrFlag = [];

    resultList.map( item => {
      let isExised = ArrFlag.find( result => result === item.result );

      if( !isExised )
      {
        ArrFlag.push(item.result);
      } 
    })

    /** 參賽客戶端陣列中拳種都一樣或三樣都有的結果返回 false，表示和局 */
    if( ArrFlag.length === 1 || ArrFlag.length === 3 )
      return true;

    return false;
  }

  /** [ACTION]-處理遊戲結果 */
  let handleGameResult = () => {

    /** Data Format */
    let resultList = [];

    resultList.push({id:game.id, username:game.username, result:game.result});

    for( let member of game.memberList ){
      if( member.result !== 4 && member.id !== game.id )
        resultList.push({id:member.id, username:member.username, result:member.result});
    }

    /** 檢查是否和局 */
    let tieCheck = checkIsTie(resultList);

    /** 和局  */
    if( tieCheck )
    {
      alert(`本局和局，你將與其他參賽者繼續下一局遊戲`);

      /** 更新按鈕可重新選擇 */
      setBtnStates({...btnStates, btnSubmit:false, btnPaper:false, btnScissors:false, btnRock:false});
      /** 更新遊戲狀態初始化 */
      let _memberList = game.memberList.map( member => ( member.result !== 4 ) ? { ...member, result:0 } : member );

      /** 更新比賽資訊 */
      setGame({...game, round:game.round + 1, result:0, memberList:_memberList});

    }else{
      /** 猜拳規則 */
      const ROCK_GAME_RULE = {
        /** 剪刀會輸石頭 */
        '1':2,
        /** 石頭會輸布 */
        '2':3,
        /** 布會輸剪刀 */
        '3':1
      }
      let winResult = 0, initValue=0;
      let winFlag = false;

      for( let item of resultList )
      {
        if( winResult === 0 ){
          /** 紀錄最初值 */
          initValue = item.result;
          /** 贏的拳種 */
          winResult = ROCK_GAME_RULE[item.result];
        }else{
          if( winResult === item.result )
          {
            /** 找到贏的拳種，跳出 */
            winFlag = true;
            break;
          }
        }
      }
      winResult = ( winFlag ) ? winResult : initValue;

      /** 區分輸家贏家 */
      let _resultList = resultList.map( item => ( item.result === winResult ) ? { ...item, result:0 } : { ...item, result:4 } );

      /** 更新遊戲相關狀態 */
      let user = _resultList.find( item => item.id === game.id );

      setGame({...game, result:user.result, round:game.round+1, memberList:_resultList });      

      /** 更新按鈕重新開放 */
      setBtnStates({...btnStates, btnSubmit:false, btnRock:false, btnScissors:false, btnPaper:false});
    }
  }

  /** [ACTION]-「猜拳」按鈕按下事件 */
  let btnClickEvent = (result) => { 
    /** 更改猜拳狀態 */
    if( !result )
    {
      alert('[Function Error-btnClickEvent] 參數錯誤');
      return;
    }

    /** 改變遊戲參數 */
    setGame({...game, result});
  
    /** 選中拳種，其餘初始化 */
    ( result === 1 ) ? 
      setBtnStates({...btnStates, btnScissors:true, btnRock:false, btnPaper:false}) :
        ( result === 2 ) ?
          setBtnStates({...btnStates, btnScissors:false, btnRock:true, btnPaper:false}) : 
          ( result === 3 ) ?
            setBtnStates({...btnStates, btnScissors:false, btnRock:false, btnPaper:true}) : 
            setBtnStates({...btnStates, btnScissors:false, btnRock:false, btnPaper:false})
                      
  }

  /** [ACTION]-「決定」按鈕按下事件 */
  let btnSubmitClickEvent = () => {

    /** 一定要選擇出拳後才能送出結果 */
    if( game.result === 0 )
    {
      alert('請選擇出哪種拳');
      return;
    }
    /** 按下後不能更改決定 */
    setBtnStates({btnSubmit:!btnStates.btnSubmit});

    /** 通知其他客戶端猜拳狀態改變 */
    socket.emit('sendResult', {id:game.id, roomId:game.roomId, result:game.result});
  }

  /** 初始化 */
  useEffect(() => {

    
  }, []);

  return (
    <>
      <div className="w-full h-screen bg-gray-100 flex justify-center items-center py-14 px-20">
        <div className="flex rounded-lg bg-white w-full max-w-5xl h-full ">
          {/* main section */}
          <section className="w-full lg:w-3/4 white h-full px-8 py-8 flex flex-col">
            <header className="text-2xl font-extrabold px-4 mb-4 flex w-full justify-between items-center">
              <span className="text-xl font-extralbold ">猜拳決定勝負吧 !</span>
              <Button
                id='btn-submit'
                color="failure"
                size="sm"
                pill
                onClick={btnSubmitClickEvent}
                disabled={(btnStates.btnSubmit)}
              >
                <span className="text-xl text-white font-bold tracking-wider whitespace-nowrap">決定 !</span>
              </Button>
            </header>
            <main className="flex flex-1 py-4 px-4 overflow-auto">
              <ul className="flex flex-col w-full">
                {
                  game.memberList.map( member => {
                    return (
                      member.id !== game.id ?
                      <li key={member.id} className="px-6 py-2 mb-4 bg-gray-100 w-full flex rounded items-center cursor-pointer">
                        <span className="text-sm bg-[#00d9ff] px-2 rounded-lg mr-2 flex items-center font-semibold">
                        { 
                          member.result === 1 ? '已決定' : 
                            member.result === 4 ? '猜拳失敗' : '決定中' 
                        }</span>
                        <span className="text-base font-semibold">{member.username}</span>
                      </li>
                      : ''
                    )
                  })
                }
              </ul>
            </main>
            <footer className="flex justify-evenly py-4">
              <Button
                id='btn-scissors'
                name="1"
                className='px-6'
                color="warning"
                size="sm"
                onClick={()=>{btnClickEvent(1)}}
                disabled={btnStates.btnSubmit}
              >
                <span className="text-xl text-white font-bold tracking-wider whitespace-nowrap pr-2">剪刀</span>
                { btnStates.btnScissors ? <HiCheck size={20} /> : '' }
                
              </Button>
                
              <Button
                id='btn-rock'
                name='2'
                className='px-6'
                color="purple"
                size="sm"
                onClick={()=>{btnClickEvent(2)}}
                disabled={btnStates.btnSubmit}
              >
                <span className="text-xl text-white font-bold tracking-wider whitespace-nowrap pr-2">石頭</span>
                { btnStates.btnRock ? <HiCheck size={20} /> : '' }
              </Button>
              <Button
                id='btn-paper'
                name='2'
                className='px-6'
                color="success"
                size="sm"
                onClick={()=>{btnClickEvent(3)}}
                disabled={btnStates.btnSubmit}
              >
                <span className="text-xl text-white font-bold tracking-wider whitespace-nowrap pr-2">布</span>
                { btnStates.btnPaper ? <HiCheck size={20} /> : '' }
              </Button>
            </footer>
          </section>
          {/** aside user info */}
          <aside className="lg:block h-full justify-center bg-[#2775F2] w-[300px] lg:px-6 lg:py-y px-4 py-6 hidden border-l-2 rounded-r-lg">
            <section className="flex flex-col w-full full justify-center">
              <span className="text-2xl mb-4 text-white font-bold text-center">ROUND：{game.round}</span>
              <Avatar
                className='cursor-pointer'
                stacked
                size="xl"
                rounded
                img={profile}
              />
              <span className="text-base text-center text-white mt-4">激烈選擇中!</span>
              <h1 className="text-3xl font-bold text-center text-black mt-4 whitespace-nowrap overflow-hidden text-ellipsis bg-blue-100 inline-block py-2 rounded-lg">
                {game.username}
              </h1>

              <div className="flex items-center px-4 py-2 text-3xl font-semibold h-full bg-gray-100 rounded-lg mt-8 mb-4">
                <img src={trophy} width="32px" height="32px" alt="" />：
                <span className='text-center w-full'>0</span>
              </div>
              <div className="flex items-center px-4 py-2 text-3xl font-semibold h-full bg-gray-100 rounded-lg">
                <img src={flag} width="32px" height="32px" alt="" />：
                <span className='text-center w-full '>0</span>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </>
  )
}

export default MainLayout