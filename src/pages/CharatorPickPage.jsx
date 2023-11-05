import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Spinner, Checkbox } from 'flowbite-react';
import profile from '../asset/avatar/profile.png';
import trophy from '../asset/icons/trophy.png';
import flag from '../asset/icons/flag.png';
import axios from 'axios';


function CharatorPickPage({ socket }) {

  /** [REACT FUNCTION] navigate */
  const navigate = useNavigate();

  /** [REACT FUNCTION] 加載狀態 */
  let [loadFlag, setLoading] = useState({
    goClick: false
  });

  /** [REACT FUNCTION] Checkbox 狀態 */
  let [checkStates, setCheckStates] = useState({});

  /** [REACT FUNCTION] People List 狀態 */
  let [people, setPeople] = useState([]);

  /** [REACT FUNCTION] 已選數量人物參考 */
  let selectUsercCountRef = useRef(0);

  /** [REACT FUNCTION] 使用者參考 */
  let userRef = useRef({});

  /** [ ACTION ]-選擇人物 Checkbox List 點擊事件
   *  變更已選擇的人數，紀錄 Checkbox 狀態
   *  @param {object} e 該 Dom 元素
   */
  let checkboxChangeEvent = (e) => {

    const { name, checked } = e.target;

    if (checked) {
      /** 增加選擇總數 */
      selectUsercCountRef.current++;
      /** 更新使用者參考為「選擇中」 */
      userRef.current.type = 1;
      /** 更新使用者狀態為「選擇中」 */
      updatePeopleStatus(userRef.current.id, userRef.current);

    } else {
      /** 減少選擇總數 */
      selectUsercCountRef.current--;
      /** 更新使用者參考為「可邀請」 */
      userRef.current.type = 0;
      /** 更新使用者狀態為「可邀請」 */
      updatePeopleStatus(userRef.current.id, userRef.current);
    }

    /** 通知其他在線者狀態變化 */
    socket.emit('updateStates', userRef.current);

    setCheckStates({
      ...checkStates,
      [name]: checked
    })
  }

  /** [ ACTION ]-取得人物遊戲狀態 
   *  @param { String } username 該人物名稱 
   *  @return { String } 該人物遊戲狀態
  */
  let getPeopleType = (username) => {
    if (!username) return '';

    let user = people.find(item => {
      return item.username === username;
    })

    return (user) ? user.type : '';
  }

  /** [ ACTION ]-取得人物名稱
   *  @param { String } id 該人物 id 
   *  @return { String } 該人物名稱
  */
  let getUsername = (id) => {
    if (!id) {
      alert(alert(`[Error-getUsername] 取得在線人物名稱失敗`));
      return '';
    }

    let user = people.find(item => item.id === id);
    
    if( !user ){
      alert(`[Error-getUsername] 取得在線人物名稱失敗，查無此ID:${id}`);
      return '';
    }
    return user.username
  }

  /** [ ACTION ]-更新 People 狀態
   *  @param { String } id 使用者唯一碼
   *  @param { Object } user 該 User 對象
  */
  const updatePeopleStatus = (id, user) => {

    if (!id || !user) {
      alert(`[FUNCTION ERROR-updatePeopleStatus]參數或是遊戲狀態錯誤, id:${id}, user:${user}`);
      return;
    }

    const newPeople = people.map((person) => {
      if (person.id === id)
        return { ...person, ...user }

      return person;
    });

    setPeople(newPeople);
  };

  /** [ API ]-開始按鈕點擊事件
   *  操作開始按鈕加載動畫， 執行遊戲流程
   */
  let goClickEvent = () => {
    try {
      /** Go按鈕顯示加載 */
      setLoading({
        ...loadFlag,
        goClick: true
      });

      if( Object.keys(checkStates).length === 0 )
        throw new Error('請至少選擇一位遊玩!!');      

    /** 發出遊玩邀請 */
    let roomId = `room-${userRef.current.username}-${new Date().getTime()}`;
    let memberNameList = Object.entries(checkStates).filter(([key, value]) => value === true).map(([key, value])=> key.split('checkbox-')[1]);

    let memberList = memberNameList.map( id => ({id, username:getUsername(id), result:0}) );


    /** 須將自己也加進去 */
    memberList.push({ id: userRef.current.id, username:userRef.current.username, result:0});

    /** 邀請其他玩家遊玩 */
    socket.emit('invite', {roomId, username:userRef.current.username, memberList});
    
    /** 通知其他客戶端狀態變化 */
    socket.emit('updateStates', {id:userRef.current.id, type:2});

    /** 進入 Main Page */
    navigate('/main', {state:{roomId, memberList, username:userRef.current.username}});

    } catch (error) {
      /** Go按鈕加載動畫取消 */
      setLoading({
        ...loadFlag,
        goClick: false
      });
      /** Log recording */
      alert(error.message)
    }
  }

  /** [ ACTION ] 初始化 */
  useEffect(() => {

    /** 確認 LocalStorage Username */
    const username = window.localStorage.getItem('username');

    if (!username) navigate('/');

    /** 取得 People List 資料，更新目前資料 */
    const getPeople = async () => {

      const GET_URL = `${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/users`;

      let result = await axios.get(GET_URL);

      if (result.status !== 200) {
        alert(`[Error-initial] 取得在線人物清單失敗, Message:${result.data.message}`);
        navigate('/login');
      }

      /** 取得當前使用者資訊 */
      let user = result.data.find(item => {
        return item.username === username
      });

      if (!user) {
        alert('[Error-initial] 初始化當前使用者失敗');
        navigate('/login');
      }

      /** 更新當前使用者參考 */
      userRef.current = user;

      /** 更新 People List 狀態 */
      setPeople(result.data);

    }

    getPeople();

    /**  Socket io 事件 */

    /** 監聽其他使用者上線 */
    socket.on('onlineResponse', (data) => {
      setPeople(data);
    })

    /** 監聽其他使用者狀態更改 */
    socket.on('statesResponse', (data) => {

      /** 是否為自己的錯誤回報 */
      if (data.status === 500) {
        alert(data.message);
      } else {
        setPeople(data);
      }
    })

    /** 監聽他人他送的遊戲邀請 */
    socket.on('inviteResponse', (data) => {
      let { roomId, memberList } = data;

      /** 加入遊戲 Socket 房間 */
      if( roomId )
        socket.emit('joinRoom', {roomId});

      /** 跳轉至 Main Page */

      let params = {
        username:userRef.current.username,
        roomId, 
        memberList
      }

      /** 通知其他客戶端遊戲狀態變更 */
      socket.emit('updateStates', {id:userRef.current.id, type:2});

      /** 導向 Main Page */
      navigate('/main', { state : params });
    })

  }, [])

  return (
    <>
      <div className="w-full h-screen bg-gray-100 flex justify-center items-center py-14 px-20">
        <div className="flex rounded-lg bg-white w-full max-w-5xl h-full ">
          {/* charactor pick section */}
          <section className="w-full lg:w-3/4 white h-full px-8 py-8 flex flex-col">
            <header className="text-2xl font-extrabold px-4 mb-4 flex w-full justify-between items-center">
              <span className="text-2xl font-extralbold ">選擇至少一個人來猜拳吧!</span>
              <div className="flex">
                <span className="text-base font-bold text-white bg-gray-600 rounded-lg flex items-center px-4 mr-4 whitespace-nowrap">已選擇：{selectUsercCountRef.current}</span>
                <Button
                  color='blue'
                  size="sm"
                  pill
                  onClick={goClickEvent}
                >
                  <span className="text-base text-white font-bold tracking-wider whitespace-nowrap">Go !</span>
                  {
                    (loadFlag.goClick) ? (
                      <Spinner
                        className="ml-1"
                        aria-label="Spinner button"
                        size="sm"
                      />) : ""
                  }
                </Button>
              </div>
            </header>
            <div className="overflow-auto w-full">
              <ul className="flex flex-col py-2 px-4">
                {
                  people.map(item => {
                    return (
                      (item.username !== userRef.current.username) ?
                        <li
                          key={item.id}
                          className="px-6 py-2 mb-4 bg-gray-100 w-full flex rounded items-center cursor-pointer"
                        >
                          <Checkbox
                            className="mr-5"
                            id={item.id}
                            name={`checkbox-${item.id}`}
                            checked={checkStates[`checkbox-${item.id}`] || false}
                            onChange={checkboxChangeEvent}
                            disabled={loadFlag.goClick || (item.type !== 0)}

                          />
                          <span
                            className=" text-sm bg-[#00d9ff] px-2 rounded-lg mr-2 flex items-center font-semibold"
                          >
                            {
                              (
                                getPeopleType(item.username) === 0 ? '可預約' :
                                  getPeopleType(item.username) === 1 ? '選擇中' :
                                    getPeopleType(item.username) === 2 ? '遊戲中' : '已離線'
                              )
                            }
                          </span>
                          <span className="text-base font-semibold">{item.username}</span>
                        </li> : ""
                    )
                  })
                }
              </ul>
            </div>
          </section>
          {/** aside user info */}
          <aside className="lg:block h-full justify-center bg-[#2775F2] w-[300px] lg:px-6 lg:py-y px-4 py-6 hidden border-l-2 rounded-r-lg">
            <section className="flex flex-col w-full full justify-center">
              <Avatar
                className='cursor-pointer'
                stacked
                size="xl"
                rounded
                img={profile}
              />
              <h1 className="text-3xl font-bold text-center text-white mt-4 whitespace-nowrap overflow-hidden text-ellipsis">
                {userRef.current.username}
              </h1>
              <div className="flex mt-1 mb-8 justify-center">
                <span className=" text-sm bg-[#00d9ff] px-2 rounded-lg mr-2 flex items-center font-semibold">
                  {
                    userRef.current.type === 0 ? '可預約' : userRef.current.type === 1 ? '選擇中' : '遊戲中'
                  }
                </span>
                <span className="text-base text-center text-white ">歡迎玩遊戲</span>
              </div>

              <div className="flex items-center px-4 py-2 text-3xl font-semibold ml-4 h-full bg-gray-100 rounded-lg mb-4">
                <img src={trophy} width="32px" height="32px" alt="" />：
                <span className='text-center w-full'>{userRef.current.win || 0}</span>
              </div>
              <div className="flex items-center px-4 py-2 text-3xl font-semibold ml-4 h-full bg-gray-100 rounded-lg">
                <img src={flag} width="32px" height="32px" alt="" />：
                <span className='text-center w-full '>{userRef.current.lose || 0}</span>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </>
  )
}

export default CharatorPickPage