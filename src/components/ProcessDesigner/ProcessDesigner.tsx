import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hook/hooks';
import { handleProcessId, handleProcessName } from '../../redux/slice/bpmnSlice';

// 引入bpmn建模器
import BpmnModeler from 'bpmn-js/lib/Modeler';

// 引入属性解析文件和对应的解析器
import flowableDescriptor from '../../bpmn/descriptor/flowable.json';
import { flowableExtension } from '../../bpmn/moddle/flowable';
import camundaDescriptor from '../../bpmn/descriptor/camunda.json';
import { camundaExtension } from '../../bpmn/moddle/camunda';
import activitiDescriptor from '../../bpmn/descriptor/activiti.json';
import { activitiExtension } from '../../bpmn/moddle/activiti';

// 引入翻译模块
import translationsCN from '../../bpmn/translate/zh.js';
import customTranslate from '../../bpmn/translate/customTranslate.js';

// 模拟流转流程
import TokenSimulationModule from 'bpmn-js-token-simulation';
import 'bpmn-js-token-simulation/assets/css/bpmn-js-token-simulation.css';

// 引入当前组件样式
import {
  Button,
  Col,
  ConfigProvider,
  Dropdown,
  MenuProps,
  message,
  Modal,
  Row,
  Space,
  Tooltip,
} from 'antd';

// 组件引入
import PropertyPanel from '../../components/ProcessDesigner/components/PropertyPanel/PropertyPanel';
import Previewer from '../../components/ProcessDesigner/components/Previewer/Previewer';
import {
  AlignLeftOutlined,
  AlignRightOutlined,
  VerticalAlignBottomOutlined,
  AlignCenterOutlined,
  BugOutlined,
  CompressOutlined,
  DownloadOutlined,
  EyeOutlined,
  FolderOpenOutlined,
  RedoOutlined,
  SyncOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignMiddleOutlined,
} from '@ant-design/icons';
import ConfigServer from '../../components/ProcessDesigner/components/ConfigServer/ConfigServer';

// 常量引入
import {
  ACTIVITI_PREFIX,
  CAMUNDA_PREFIX,
  FLOWABLE_PREFIX,
} from '../../bpmn/constant/constants';
import { darkThemeData, defaultThemeData } from '../../pages/globalTheme';

export default function ProcessDesigner() {
  // state
  const [bpmnModeler, setBpmnModeler] = useState<any>();
  const [simulationStatus, setSimulationStatus] = useState<boolean>(false);
  const [zoomSize, setZoomSize] = useState<number>(1);
  const [revocable, setRevocable] = useState<boolean>(false);
  const [recoverable, setRecoverable] = useState<boolean>(false);
  // redux
  const bpmnPrefix = useAppSelector((state) => state.bpmn.prefix);
  const processId = useAppSelector((state) => state.bpmn.processId);
  const processName = useAppSelector((state) => state.bpmn.processName);
  const colorPrimary = useAppSelector((state) => state.theme.colorPrimary);
  const borderRadius = useAppSelector((state) => state.theme.borderRadius);
  const darkMode = useAppSelector((state) => state.theme.darkMode);
  const dispatch = useAppDispatch();

  /**
   * 初始化建模器
   * 1、这一步在绘制流程图之前进行，且随流程前缀改变而改变；
   * 2、因为解析器和解析文件与流程引擎类型(也就是前缀)有关，因此这里依赖的变量是放在redux里的流程前缀名
   */
  useEffect(() => {
    // 重新加载前需要销毁之前的modeler，否则页面上会加载出多个建模器
    if (bpmnModeler) {
      bpmnModeler.destroy();
      setBpmnModeler(undefined);
    }
    (async() => {
      // 每次重新加载前需要先消除之前的流程信息
      dispatch(handleProcessId(undefined));
      await dispatch(handleProcessName(undefined));
      initBpmnModeler();
      
      
    })()
  })

  /**
   * 初始化建模器
   */
  function initBpmnModeler() {
    console.log('【初始化建模器】1、初始化建模器开始');
    
    const modeler = new BpmnModeler({
      container: '#canvas',
      height: '96.5vh',
      additionalModules: getAdditionalModules(),
      moddleExtensions: getModdleExtensions(),
    });
    setBpmnModeler(modeler);
    
    /**
     * 添加解析器
     */
    function getAdditionalModules() {
      console.log('【初始化建模器】2、添加解析器');
      const modules: Array<any> = [];
      if (bpmnPrefix === FLOWABLE_PREFIX) {
        modules.push(flowableExtension);
      }
      if (bpmnPrefix === CAMUNDA_PREFIX) {
        modules.push(camundaExtension);
      }
      if (bpmnPrefix === ACTIVITI_PREFIX) {
        modules.push(activitiExtension);
      }
      // 添加翻译模块
      const TranslateModule = {
        // translate: ["value", customTranslate(translations || translationsCN)] translations是自定义的翻译文件
        translate: ['value', customTranslate(translationsCN)],
      };
      modules.push(TranslateModule);
      // 添加模拟流转模块
      modules.push(TokenSimulationModule);
      return modules;
    }
    
      /**
     * 添加解析文件
     */
    function getModdleExtensions() {
      console.log('【初始化建模器】3、添加解析文件');
      const extensions: any = {};
      if (bpmnPrefix === FLOWABLE_PREFIX) {
        extensions.flowable = flowableDescriptor;
      }
      if (bpmnPrefix === CAMUNDA_PREFIX) {
        extensions.camunda = camundaDescriptor;
      }
      if (bpmnPrefix === ACTIVITI_PREFIX) {
        extensions.activiti = activitiDescriptor;
      }
      return extensions;
    }
  
    console.log('【初始化建模器】4、初始化建模器结束');
  }

  return (
    <>
    <ConfigProvider
        theme={{
          token: {
            colorPrimary: colorPrimary,
            borderRadius: borderRadius,
            // 暗夜主题
            ...(darkMode && darkThemeData),
          },
        }}
      >
        <Row
          gutter={0}
          style={{
            backgroundColor: darkMode
              ? defaultThemeData.darkBgColor
              : defaultThemeData.lightBgColor,
          }}
        >
          <Col span={1}>
            {/*todo 2022/10/31 快捷工具栏，暂时留空，后面补充一个简易palette栏*/}
          </Col>
          <Col span={17}>
            {/* {renderToolBar()} */}
            <div
              id="canvas"
              style={{
                backgroundColor: darkMode
                  ? defaultThemeData.darkCanvasBgColor
                  : defaultThemeData.lightCanvasBgColor,
                backgroundImage:
                  'linear-gradient(#8E8E8E 1px, transparent 0), linear-gradient(90deg,#8E8E8E 1px, transparent 0)',
                backgroundSize: '20px 20px',
              }}
            />
          </Col>
          <Col
            span={6}
            style={{
              height: '100vh',
              overflowY: 'auto',
              backgroundColor: darkMode
                ? defaultThemeData.darkBgColor
                : defaultThemeData.lightBgColor,
              // borderLeft: '1px solid #eee ',
            }}
          >
            <PropertyPanel modeler={bpmnModeler} />
          </Col>
        </Row>
      </ConfigProvider>
    </>
  )
}