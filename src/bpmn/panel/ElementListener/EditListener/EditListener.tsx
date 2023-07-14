import React, { Ref, useImperativeHandle, useRef, useState } from 'react';
import {
  Drawer,
  Button,
  Select,
  Space,
  Input,
  Divider,
  Form,
  Table,
  Typography,
  notification,
} from 'antd';
import {
  encapsulateField,
  execute_event_type_options,
  listener_type,
  listener_type_options,
  script_type,
  script_type_options,
  task_event_type,
  task_event_type_options,
  timer_type,
  timer_type_options,
} from '@/bpmn/panel/ElementListener/dataSelf';
import { AppstoreOutlined } from '@ant-design/icons';
import EditField from '@/bpmn/panel/ElementListener/EditListener/EditField/EditField';

const { Option } = Select;

interface IProps {
  onRef: Ref<any>;
  isTask: boolean;
  reFreshParent: (options: any) => any;
}

export default function EditListener(props: IProps) {
  // props
  const { onRef, isTask, reFreshParent } = props;
  // state
  const [open, setOpen] = useState(false);
  const [fieldList, setFieldList] = useState<Array<any>>([]);
  // ref
  const editRef = useRef<any>();
  // form
  const [form] = Form.useForm<{
    key: number;
    eventType: string;
    eventId: string;
    listenerType: string;
    javaClass: string;
    expression: string;
    delegateExpression: string;
    scriptType: string;
    scriptFormat: string;
    scriptValue: string;
    resource: string;
    timerType: string;
    timerValue: string;
  }>();
  // 监听form字段
  const eventType = Form.useWatch('eventType', form);
  const listenerType = Form.useWatch('listenerType', form);
  const scriptType = Form.useWatch('scriptType', form);
  const timerType = Form.useWatch('timerType', form);

  // 暴露给父组件的方法
  useImperativeHandle(onRef, () => ({
    // 打开弹窗
    showEditDrawer: (rowObj: any) => showDrawer(rowObj),
  }));

  /**
   * 打开弹窗并初始化页面数据
   *
   * @param rowObj
   */
  function showDrawer(rowObj: any) {
    initPageData(rowObj);
    setOpen(true);
  }

  /**
   * 关闭弹窗并重置页面数据
   */
  function closeDrawer() {
    form.resetFields();
    setOpen(false);
  }

  /**
   * 初始化页面数据
   *
   * @param rowObj
   */
  function initPageData(rowObj: any) {
    form.setFieldsValue({
      key: rowObj?.key || -1,
      eventType: rowObj?.protoListener?.eventType.value,
      eventId: rowObj?.protoListener?.id,
      listenerType: rowObj?.protoListener?.listenerType.value,
      javaClass: rowObj?.protoListener?.class,
      expression: rowObj?.protoListener?.expression,
      delegateExpression: rowObj?.protoListener?.delegateExpression,
      scriptType: rowObj?.protoListener?.scriptType?.value,
      scriptFormat: rowObj?.protoListener?.script?.scriptFormat,
      scriptValue: rowObj?.protoListener?.script?.value,
      resource: rowObj?.protoListener?.script?.resource,
      timerType: rowObj?.protoListener?.timerType,
      timerValue: rowObj?.protoListener?.timerValue,
    });
    // 初始化rows
    let fields: Array<any> = rowObj?.protoListener?.fields || [];
    let rows: Array<any> = fields.map((el, index) => {
      let field: any = encapsulateField(el);
      let row: any = Object.create(null);
      row.key = index + 1;
      row.fieldName = field.name;
      row.fieldType = field.fieldType.name;
      row.fieldTypeValue = field.fieldType.value;
      row.fieldValue = field.string || field.expression;
      return row;
    });
    setFieldList(rows);
  }

  /**
   * 提交表单
   */
  function handleOK() {
    form
      .validateFields()
      .then((values) => {
        // 更新父组件表格数据
        reFreshParent({
          rowKey: form.getFieldValue('key'),
          ...values,
          fields: [...fieldList],
        });
        closeDrawer();
      })
      .catch((info) => {
        console.log('表单校验失败: ', info);
      });
  }

  /**
   * 新建或修改注入字段
   *
   * @param rowObj [key, fieldName, fieldType, fieldTypeValue, fieldValue]
   */
  function createOrUpdateField(rowObj: any) {
    const { key } = rowObj;
    let newRows: Array<any> = [...fieldList];
    rowObj.key = key > 0 ? key : fieldList.length + 1;
    newRows.splice(rowObj.key - 1, 1, rowObj);
    setFieldList(newRows);
  }

  /**
   * 移除注入字段
   *
   * @param key
   */
  function removeField(key: number) {
    let newRows: Array<any> = [...fieldList];
    newRows.splice(key - 1, 1);
    newRows = newRows.map((el, index) => {
      if (el.key !== key) {
        el.key = index + 1;
        return el;
      }
    });
    setFieldList(newRows);
    // 提示通知
    notification.open({
      message: <span style={{ color: 'red' }}>{'字段已删除'}</span>,
      placement: 'top',
      duration: 2,
      description: `已删除编号为 ${key} 的字段`,
    });
  }

  /**
   * 渲染监听器表单
   */
  function renderListenerForm() {
    switch (listenerType) {
      case listener_type.class:
        return (
          <Form.Item
            name="javaClass"
            label="Java类"
            rules={[{ required: true, message: '请输入Java类名' }]}
          >
            <Input placeholder="请输入" />
          </Form.Item>
        );
      case listener_type.expression:
        return (
          <Form.Item
            name="expression"
            label="表达式"
            rules={[{ required: true, message: '请输入表达式' }]}
          >
            <Input placeholder="请输入" />
          </Form.Item>
        );
      case listener_type.delegateExpression:
        return (
          <Form.Item
            name="delegateExpression"
            label="代理表达式"
            rules={[{ required: true, message: '请输入代理表达式' }]}
          >
            <Input placeholder="请输入" />
          </Form.Item>
        );
      case listener_type.script:
        return (
          <>
            <Form.Item
              name="scriptFormat"
              label="脚本格式"
              rules={[{ required: true, message: '请输入脚本格式' }]}
            >
              <Input placeholder="请输入" />
            </Form.Item>
            <Form.Item
              name="scriptType"
              label="脚本类型"
              rules={[{ required: true, message: '请选择脚本类型' }]}
            >
              <Select placeholder={'请选择'} value={scriptType}>
                {script_type_options.map((e) => {
                  return (
                    <Option key={e.value} value={e.value}>
                      {e.name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            {scriptType === script_type.inlineScript && (
              <Form.Item
                name="scriptValue"
                label="脚本内容"
                rules={[{ required: true, message: '请输入脚本内容' }]}
              >
                <Input placeholder="请输入" />
              </Form.Item>
            )}
            {scriptType === script_type.externalResource && (
              <Form.Item
                name="resource"
                label="资源地址"
                rules={[{ required: true, message: '请输入资源地址' }]}
              >
                <Input placeholder="请输入" />
              </Form.Item>
            )}
          </>
        );
    }
  }

  /**
   * 渲染超时组件，事件类型为超时时需要渲染
   */
  function renderTimeOutForm() {
    if (eventType === task_event_type.timeout) {
      return (
        <>
          <Form.Item
            name="timerType"
            label="定时器类型"
            rules={[{ required: true }]}
          >
            <Select>
              {timer_type_options.map((e) => {
                return (
                  <Option key={e.value} value={e.value}>
                    {e.name}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          {timerType !== timer_type.none && (
            <Form.Item
              name="timerValue"
              label="定时器"
              rules={[{ required: true, message: '请输入定时器设置' }]}
            >
              <Input placeholder="请输入" />
            </Form.Item>
          )}
        </>
      );
    }
  }

  // 列
  const columns = [
    {
      title: '序号',
      width: 40,
      dataIndex: 'key',
      key: 'key',
      render: (text: any) => text,
    },
    {
      title: '字段名称',
      width: 80,
      dataIndex: 'fieldName',
      key: 'fieldName',
      ellipsis: true,
    },
    {
      title: '字段类型',
      width: 80,
      dataIndex: 'fieldType',
      key: 'fieldType',
      ellipsis: true,
    },
    {
      title: '字段值/表达式',
      width: 100,
      dataIndex: 'fieldValue',
      key: 'fieldValue',
      ellipsis: true,
    },
    {
      title: '操作',
      width: 80,
      key: 'action',
      render: (text: string, record: any) => (
        <Space size={0}>
          <Button
            type="text"
            size={'small'}
            style={{ color: '#1890ff' }}
            onClick={() => {
              editRef.current.showEditModal(record);
            }}
          >
            {'编辑'}
          </Button>
          <Button
            danger
            type="text"
            size={'small'}
            onClick={() => removeField(record.key)}
          >
            {'删除'}
          </Button>
        </Space>
      ),
    },
  ];

  /**
   * 渲染表格
   */
  function renderTable() {
    return (
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography style={{ fontWeight: 'bold' }}>
            <AppstoreOutlined />
            &nbsp;注入字段
          </Typography>
          <Button
            type="primary"
            size={'small'}
            onClick={() => {
              editRef.current.showEditModal();
            }}
          >
            <span>新增字段</span>
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={fieldList}
          pagination={false}
          bordered
          size={'small'}
        />
      </Space>
    );
  }

  return (
    <>
      <Drawer
        width={495}
        title="属性配置"
        placement="right"
        closable={false}
        onClose={closeDrawer}
        open={open}
      >
        <Form labelCol={{ span: 5 }} wrapperCol={{ span: 18 }} form={form}>
          <Form.Item
            name="eventType"
            label="事件类型"
            rules={[{ required: true, message: '请选择事件类型' }]}
          >
            <Select placeholder={'请选择'}>
              {(isTask
                ? task_event_type_options
                : execute_event_type_options
              ).map((e) => {
                return (
                  <Option key={e.value} value={e.value}>
                    {e.name}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          {isTask && (
            <Form.Item
              name="eventId"
              label="事件id"
              rules={[{ required: true, message: '请输入事件id' }]}
            >
              <Input placeholder="请输入" />
            </Form.Item>
          )}
          <Form.Item
            name="listenerType"
            label="监听器类型"
            rules={[{ required: true, message: '请选择监听器类型' }]}
          >
            <Select placeholder={'请选择'}>
              {listener_type_options.map((e) => {
                return (
                  <Option key={e.value} value={e.value}>
                    {e.name}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          {renderListenerForm()}
          {renderTimeOutForm()}

          <Divider />
          {renderTable()}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 8,
              width: '100%',
            }}
          >
            <Button style={{ width: '49%' }} onClick={closeDrawer}>
              {'取消'}
            </Button>
            <Button style={{ width: '49%' }} type="primary" onClick={handleOK}>
              {'确定'}
            </Button>
          </div>
        </Form>
      </Drawer>

      <EditField onRef={editRef} reFreshParent={createOrUpdateField} />
    </>
  );
}
