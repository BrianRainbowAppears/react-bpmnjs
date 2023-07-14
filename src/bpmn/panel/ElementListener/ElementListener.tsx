import React, { useEffect, useRef, useState } from 'react';
import { Button, Empty, notification, Space, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { encapsulateListener } from '@/bpmn/panel/ElementListener/dataSelf';
import EditListener from '@/bpmn/panel/ElementListener/EditListener/EditListener';
import {
  createListenerObject,
  extractExtensionList,
  extractOtherExtensionList,
  updateElementExtensions,
} from '@/bpmn/util/panelUtil';
import { useAppSelector } from '@/redux/hook/hooks';

// 监听器节点类型
const ELEMENT_LISTENER_TYPE = {
  TaskListener: 'TaskListener',
  ExecutionListener: 'ExecutionListener',
};

interface IProps {
  businessObject: any;
  isTask: boolean;
}

/**
 * 执行监听器/任务监听器 组件
 *
 * @param props
 * @constructor
 */
export default function ElementListener(props: IProps) {
  // props
  const { businessObject, isTask } = props;
  // state
  const [dataSource, setDataSource] = useState<Array<any>>([]);
  const [listenerList, setListenerList] = useState<Array<any>>([]);
  // ref
  const editRef = useRef<any>();
  // redux
  const prefix = useAppSelector((state) => state.bpmn.prefix);

  /**
   * 初始化
   */
  useEffect(() => {
    if (businessObject) {
      initRows();
    }
  }, [businessObject?.id]);

  /**
   * 初始化表格行数据源
   */
  function initRows() {
    // 获取监听器
    let listeners: any[] = extractExtensionList(
      prefix,
      `${
        isTask
          ? ELEMENT_LISTENER_TYPE.TaskListener
          : ELEMENT_LISTENER_TYPE.ExecutionListener
      }`,
    );
    setListenerList(listeners);
    // 设置行数据源
    let rows: any[] = listeners?.map((e, i) => {
      let listener = encapsulateListener(e);
      return {
        key: i + 1,
        eventType: listener.eventType.name,
        eventId: listener.id,
        listenerType: listener.listenerType.name,
        protoListener: listener,
      };
    });
    setDataSource(rows);
  }

  /**
   * 获取其它类型扩展元素
   */
  function getOtherExtensionList() {
    let otherExtensionList: Array<any> = extractOtherExtensionList(
      prefix,
      `${
        isTask
          ? ELEMENT_LISTENER_TYPE.TaskListener
          : ELEMENT_LISTENER_TYPE.ExecutionListener
      }`,
    );
    return otherExtensionList;
  }

  /**
   * 创建或修改监听器
   *
   * @param options
   */
  function createOrUpdate(options: any) {
    // 创建监听器对象
    let listener: any = Object.create(null);
    listener.id = options.eventId; // 只有任务监听器才需要设置事件id
    listener.event = options.eventType;
    listener.listenerType = options.listenerType;
    listener.expression = options.expression;
    listener.delegateExpression = options.delegateExpression;
    listener.class = options.javaClass;
    // 设置定时器属性
    listener.timerType = options.timerType;
    listener.timerValue = options.timerValue;
    // 创建注入字段对象
    let fields: Array<any> = options.fields;
    if (fields && fields.length > 0) {
      fields = fields.map((el) => {
        return {
          name: el.fieldName,
          fieldType: el.fieldTypeValue,
          string: el.fieldValue,
          expression: el.fieldValue,
        };
      });
    }
    // 设置注入字段属性
    listener.fields = fields;
    // 设置脚本属性
    listener.scriptType = options.scriptType;
    listener.scriptFormat = options.scriptFormat;
    listener.value = options.scriptValue;
    listener.resource = options.resource;
    // 创建监听器实例
    let listenerObject = createListenerObject(listener, isTask, prefix);
    // 将监听器实例绑定到bpmn
    let newListenerExtensionList: Array<any> = [...listenerList];
    newListenerExtensionList.splice(
      options.rowKey > 0 ? options.rowKey - 1 : listenerList.length,
      1,
      listenerObject,
    );
    updateElementExtensions(
      getOtherExtensionList().concat(newListenerExtensionList),
    );
    // 刷新表格
    initRows();
  }

  /**
   * 移除监听器
   * @param key
   */
  function remove(key: number) {
    // 将监听器实例绑定到bpmn
    let newListenerExtensionList: Array<any> = [...listenerList];
    newListenerExtensionList.splice(key - 1, 1);
    updateElementExtensions(
      getOtherExtensionList().concat(newListenerExtensionList),
    );
    // 刷新表格
    initRows();
    // 提示通知
    notification.open({
      message: <span style={{ color: 'red' }}>{'监听器已删除'}</span>,
      placement: 'top',
      duration: 2,
      description: `已删除编号为 ${key} 的监听器`,
    });
  }

  const columns = isTask
    ? [
        {
          title: '序号',
          width: 40,
          dataIndex: 'key',
          key: 'key',
          render: (text: any) => text,
        },
        {
          title: '事件类型',
          width: 80,
          dataIndex: 'eventType',
          key: 'eventType',
          ellipsis: true,
        },
        {
          title: '事件id',
          width: 80,
          dataIndex: 'eventId',
          key: 'eventId',
          ellipsis: true,
        },
        {
          title: '监听器类型',
          width: 80,
          dataIndex: 'listenerType',
          key: 'listenerType',
          ellipsis: true,
        },
        {
          title: '操作',
          width: 90,
          key: 'action',
          render: (text: string, record: any) => (
            <Space size="small">
              <Button
                type="text"
                size={'small'}
                style={{ color: '#1890ff' }}
                onClick={() => {
                  editRef.current.showEditDrawer(record);
                }}
              >
                {'编辑'}
              </Button>
              <Button
                danger
                type="text"
                size={'small'}
                onClick={() => remove(record.key)}
              >
                {'删除'}
              </Button>
            </Space>
          ),
        },
      ]
    : [
        {
          title: '序号',
          width: 40,
          dataIndex: 'key',
          key: 'key',
          render: (text: any) => <a>{text}</a>,
        },
        {
          title: '事件类型',
          width: 110,
          dataIndex: 'eventType',
          key: 'eventType',
          ellipsis: true,
        },
        {
          title: '监听器类型',
          width: 110,
          dataIndex: 'listenerType',
          key: 'listenerType',
          ellipsis: true,
        },
        {
          title: '操作',
          width: 80,
          key: 'action',
          render: (text: string, record: any) => (
            <Space size="small">
              <Button
                type="text"
                size={'small'}
                style={{ color: '#1890ff' }}
                onClick={() => {
                  editRef.current.showEditDrawer(record);
                }}
              >
                {'编辑'}
              </Button>
              <Button
                danger
                type="text"
                size={'small'}
                onClick={() => remove(record.key)}
              >
                {'删除'}
              </Button>
            </Space>
          ),
        },
      ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered
        size={'small'}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={'暂无数据'}
            />
          ),
        }}
      />
      <Button
        type="primary"
        // size={"small"}
        style={{
          width: '100%',
          marginTop: 8,
        }}
        onClick={() => {
          editRef.current.showEditDrawer();
        }}
      >
        <span style={{ marginLeft: 0 }}>添加属性</span>
      </Button>

      {/* 弹窗组件 */}
      <EditListener
        onRef={editRef}
        isTask={isTask}
        reFreshParent={createOrUpdate}
      />
    </>
  );
}
