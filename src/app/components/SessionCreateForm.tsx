"use client";
import React from "react";

// 定义 Props 接口，接收从父组件传来的函数和状态
interface Props {
  onCreate: () => void;
  isCreating: boolean;
}

const SessionCreateForm = ({ onCreate, isCreating }: Props) => {
  return (
    <div className="mb-4">
      {/* 按钮的 onClick 直接调用父组件传递的 onCreate 函数 */}
      <button
        onClick={onCreate}
        disabled={isCreating} // 根据父组件的状态来禁用按钮
        className="px-4 py-3 bg-black text-white rounded-md w-full text-left flex items-center justify-center space-x-2 hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
      >
        <span>+</span>
        <span>{isCreating ? "创建中..." : "新建会话"}</span>
      </button>
    </div>
  );
};

export default SessionCreateForm;