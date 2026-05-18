import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";

import {
  Image,
  Send,
  Trash2,
  X,
} from "lucide-react";

import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");

  const [imagePreview, setImagePreview] =
    useState(null);

  const fileInputRef = useRef(null);

  const {
    sendMessage,
    clearChat,
  } = useChatStore();

  // IMAGE CHANGE
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");

      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  // REMOVE IMAGE
  const removeImage = () => {
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // SEND MESSAGE
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim() && !imagePreview) {
      return;
    }

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // CLEAR FORM
      setText("");

      setImagePreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(
        "Failed to send message:",
        error
      );
    }
  };

  // CLEAR CHAT
  const handleClearChat = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to clear this chat?"
    );

    if (!confirmDelete) return;

    try {
      await clearChat();

      toast.success("Chat cleared");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-4 w-full">
      {/* IMAGE PREVIEW */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />

            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2"
      >
        <div className="flex-1 flex gap-2">
          {/* TEXT INPUT */}
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
          />

          {/* IMAGE INPUT */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          {/* IMAGE BUTTON */}
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${
              imagePreview
                ? "text-emerald-500"
                : "text-zinc-400"
            }`}
            onClick={() =>
              fileInputRef.current?.click()
            }
          >
            <Image size={20} />
          </button>

          {/* CLEAR CHAT BUTTON */}
          <button
            type="button"
            onClick={handleClearChat}
            className="btn btn-circle text-red-500"
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* SEND BUTTON */}
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={
            !text.trim() && !imagePreview
          }
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;