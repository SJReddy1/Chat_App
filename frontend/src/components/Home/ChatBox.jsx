import React, { useEffect, useState } from "react";
import { BsEmojiSmile, BsSendFill } from "react-icons/bs";
import Message from "./ChatBox/Mesaage";
import ChatHeader from "./ChatBox/ChatHeader";
import { useDispatch, useSelector } from "react-redux";
import logo from "../../assets/white-logo.png";
import { toast, ToastContainer } from "react-toastify";
import ScrollableFeed from "react-scrollable-feed";
import { sendMessage, setWebSocketReceivedMessage } from "../../redux/appReducer/action";
import EmojiPicker from "emoji-picker-react";

export default function ChatBox() {
  const selectedUserForChat = useSelector((state) => state.appReducer.selectedUserForChat);
  const sendMessageSuccess = useSelector((state) => state.appReducer.sendMessageSuccess);
  const sendMessageFail = useSelector((state) => state.appReducer.sendMessageFail);
  const sendMessageObj = useSelector((state) => state.appReducer.sendMessageObj);
  const sendMessageProcessing = useSelector((state) => state.appReducer.sendMessageProcessing);
  const notficationsMessages = useSelector((state) => state.appReducer.notficationsMessages);
  const getMessageProcessing = useSelector((state) => state.appReducer.getMessageProcessing);
  const getMessageData = useSelector((state) => state.appReducer.getMessageData);
  const webSocket = useSelector((state) => state.appReducer.webSocket);

  const [userInput, setUserInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const dispatch = useDispatch();

  // Handle sending message
  const handleSendMessage = () => {
    let obj = {
      content: userInput.trim(),
      chatId: selectedUserForChat._id,
    };

    if (!obj.content) {
      toast.warn("Write something to send", { position: toast.POSITION.BOTTOM_LEFT });
    } else {
      dispatch(sendMessage(obj));
    }
  };

  useEffect(() => {
    return () => {
      webSocket.off("message received");
    };
  }, [webSocket]);

  useEffect(() => {
    if (!sendMessageProcessing && !sendMessageFail && sendMessageSuccess) {
      setUserInput("");
      webSocket.emit("new message", sendMessageObj);
      dispatch(setWebSocketReceivedMessage(getMessageData, sendMessageObj, notficationsMessages, selectedUserForChat));
    }

    if (!sendMessageProcessing && sendMessageFail && !sendMessageSuccess) {
      toast.error("Message not sent. Try again.", { position: toast.POSITION.BOTTOM_LEFT });
    }
  }, [sendMessageSuccess, sendMessageFail, sendMessageProcessing]);

  useEffect(() => {
    const handleNewMessageReceived = (newMessageRec) => {
      dispatch(setWebSocketReceivedMessage(getMessageData, newMessageRec, notficationsMessages, selectedUserForChat));
    };

    webSocket.on("message received", handleNewMessageReceived);

    return () => {
      webSocket.off("message received", handleNewMessageReceived);
    };
  }, [webSocket, selectedUserForChat, getMessageData]);

  if (!selectedUserForChat) {
    return (
      <div className="flex flex-col h-4/5 mt-8 bg-primary-600 rounded-lg px-4 py-2 pb-4">
        <div className="flex flex-col items-center justify-center h-full">
          <img className="w-20 h-20 mr-2" src={logo} alt="logo" />
          <p className="text-white">Enjoy Your Chat!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ChatHeader />

      <div className="flex flex-col h-4/5 bg-primary-800 rounded-bl-lg rounded-br-lg px-4 py-2 pb-4">
        <div className="flex h-full flex-col max-h-[75vh] overflow-y-auto bg-primary-400 rounded-lg mb-2">
          {getMessageProcessing && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
              <span className="mr-2 text-white">Loading Messages</span>
            </div>
          )}

          <ScrollableFeed>
            {Array.isArray(getMessageData) && getMessageData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <img className="w-20 h-20 mr-2" src={logo} alt="logo" />
                <p className="text-white">Start Chatting!</p>
              </div>
            ) : (
              Array.isArray(getMessageData) &&
              getMessageData.map((item) => <Message item={item} key={item.id} />)
            )}
          </ScrollableFeed>
        </div>

        <div className="relative w-full">
  {/* Input Field */}
  <input
    disabled={sendMessageProcessing}
    value={userInput}
    onChange={(e) => setUserInput(e.target.value)}
    type="text"
    className="w-full border border-gray-300 bg-primary-50 text-primary-900 font-semibold sm:text-sm rounded-full focus:ring-primary-600 focus:border-primary-600 p-3 pr-14 pl-12"
    placeholder="Type your message..."
  />

  {/* Emoji Button */}
  <button
    type="button"
    className="absolute inset-y-0 left-2 flex items-center p-2 text-gray-500 hover:text-gray-700"
    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
  >
    <BsEmojiSmile className="w-5 h-5" />
  </button>

  {/* Send Button */}
  <button
    disabled={sendMessageProcessing}
    type="button"
    className="absolute inset-y-0 right-2 flex items-center justify-center w-10 h-10 bg-primary-600 hover:bg-primary-500 text-white rounded-full transition"
    onClick={handleSendMessage}
  >
    {sendMessageProcessing ? (
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
    ) : (
      <BsSendFill className="w-5 h-5" />
    )}
  </button>
</div>


        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 right-12 z-10">
            <EmojiPicker
              onEmojiClick={(emojiObject) => {
                setUserInput(userInput + emojiObject.emoji);
                setShowEmojiPicker(false);
              }}
            />
          </div>
        )}
      </div>

      <ToastContainer />
    </>
  );
}
