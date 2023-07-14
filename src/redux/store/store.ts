import { configureStore } from '@reduxjs/toolkit';
import bpmnReducer from '../../redux/slice/bpmnSlice';
import themeReducer from '../../redux/slice/themeSlice';

/**
 * 创建一个 Redux 存储，并自动配置 Redux DevTools 扩展，并在开发时检查存储
 */
export const store = configureStore({
  // 将Slice Reducers添加到Store中
  reducer: {
    bpmn: bpmnReducer,
    theme: themeReducer,
  },
});

// 从 store 本身推断出 `RootState` 和 `AppDispatch` 类型
export type RootState = ReturnType<typeof store.getState>;
// 推断出类型: {counter: counterReducer}
export type AppDispatch = typeof store.dispatch;
