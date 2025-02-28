import {
  getI18nEnabled,
  RendererPluginAction,
  RendererPluginEvent
} from 'amis-editor-core';
import flatten from 'lodash/flatten';
import {ContainerWrapper} from 'amis-editor-core';
import {registerEditorPlugin} from 'amis-editor-core';
import {isObject} from 'amis-editor-core';
import {
  BasePlugin,
  BasicSubRenderInfo,
  RendererEventContext,
  SubRendererInfo,
  BaseEventContext
} from 'amis-editor-core';
import {defaultValue, getSchemaTpl, tipedLabel} from 'amis-editor-core';
import {ValidatorTag} from '../../validator';
import {getEventControlConfig} from '../../renderer/event-control/helper';
import {inputStateTpl} from '../../renderer/style-control/helper';

export class NumberControlPlugin extends BasePlugin {
  // 关联渲染器名字
  rendererName = 'input-number';
  $schema = '/schemas/NumberControlSchema.json';

  // 组件名称
  name = '数字框';
  isBaseComponent = true;
  icon = 'fa fa-sort-numeric-asc';
  pluginIcon = 'input-number-plugin';
  description = '支持设定最大值和最小值，以及步长与精度';
  docLink = '/amis/zh-CN/components/form/input-number';
  tags = ['表单项'];
  scaffold = {
    type: 'input-number',
    label: '数字',
    name: 'number',
    keyboard: true
  };
  previewSchema: any = {
    type: 'form',
    className: 'text-left',
    mode: 'horizontal',
    wrapWithPanel: false,
    body: [
      {
        ...this.scaffold,
        value: 88
      }
    ]
  };

  notRenderFormZone = true;

  panelTitle = '数字框';
  panelJustify = true;

  // 事件定义
  events: RendererPluginEvent[] = [
    {
      eventName: 'change',
      eventLabel: '值变化',
      description: '数值变化',
      dataSchema: [
        {
          type: 'object',
          properties: {
            'event.data.value': {
              type: 'string',
              title: '输入值'
            }
          }
        }
      ]
    },
    {
      eventName: 'focus',
      eventLabel: '获取焦点',
      description: '数字框获取焦点',
      dataSchema: [
        {
          type: 'object',
          properties: {
            'event.data.value': {
              type: 'string',
              title: '当前值'
            }
          }
        }
      ]
    },
    {
      eventName: 'blur',
      eventLabel: '失去焦点',
      description: '数字框失去焦点',
      dataSchema: [
        {
          type: 'object',
          properties: {
            'event.data.value': {
              type: 'string',
              title: '当前值'
            }
          }
        }
      ]
    }
  ];

  // 动作定义
  actions: RendererPluginAction[] = [
    {
      actionType: 'clear',
      actionLabel: '清空',
      description: '清空数字框内容'
    },
    {
      actionType: 'reset',
      actionLabel: '重置',
      description: '重置为默认值'
    },
    {
      actionType: 'setValue',
      actionLabel: '赋值',
      description: '触发组件数据更新'
    }
  ];

  panelBodyCreator = (context: BaseEventContext) => {
    const i18nEnabled = getI18nEnabled();
    return getSchemaTpl('tabs', [
      {
        title: '属性',
        body: getSchemaTpl(
          'collapseGroup',
          [
            {
              title: '基本',
              body: [
                getSchemaTpl('layout:originPosition', {value: 'left-top'}),
                getSchemaTpl('formItemName', {
                  required: true
                }),
                getSchemaTpl('label'),
                {
                  type: 'switch',
                  label: tipedLabel(
                    '键盘事件',
                    '通过键盘上下方向键来加减数据值'
                  ),
                  name: 'keyboard',
                  value: true,
                  inputClassName: 'is-inline'
                },
                getSchemaTpl('kilobitSeparator'),

                getSchemaTpl('valueFormula', {
                  rendererSchema: context?.schema,
                  valueType: 'number' // 期望数值类型
                }),

                getSchemaTpl('valueFormula', {
                  name: 'min',
                  rendererSchema: {
                    ...context?.schema,
                    value: context?.schema.min
                  },
                  needDeleteProps: ['min'], // 避免自我限制
                  label: '最小值',
                  valueType: 'number'
                }),

                getSchemaTpl('valueFormula', {
                  name: 'max',
                  rendererSchema: {
                    ...context?.schema,
                    value: context?.schema.max
                  },
                  needDeleteProps: ['max'], // 避免自我限制
                  label: '最大值',
                  valueType: 'number'
                }),

                {
                  type: 'input-number',
                  name: 'step',
                  label: '步长',
                  min: 0,
                  value: 1
                },

                {
                  type: 'input-number',
                  name: 'precision',
                  label: tipedLabel(
                    '小数位数',
                    '根据四舍五入精确保留设置的小数位数'
                  ),
                  min: 1,
                  max: 100
                },
                getSchemaTpl('prefix'),
                getSchemaTpl('suffix'),
                getSchemaTpl('combo-container', {
                  type: 'combo',
                  label: '单位选项',
                  mode: 'normal',
                  name: 'unitOptions',
                  flat: true,
                  items: [
                    {
                      placeholder: '单位选项',
                      type: i18nEnabled ? 'input-text-i18n' : 'input-text',
                      name: 'text'
                    }
                  ],
                  draggable: false,
                  multiple: true,
                  pipeIn: (value: any) => {
                    if (!isObject(value)) {
                      return Array.isArray(value) ? value : [];
                    }
                    const res = value.map((item: any) => item.value);
                    return res;
                  },
                  pipeOut: (value: any[]) => {
                    if (!value.length) {
                      return undefined;
                    }
                    return value;
                  }
                }),
                getSchemaTpl('labelRemark'),
                getSchemaTpl('remark'),
                getSchemaTpl('placeholder'),
                getSchemaTpl('description'),
                getSchemaTpl('autoFillApi')
              ]
            },
            getSchemaTpl('status', {isFormItem: true}),
            getSchemaTpl('validation', {tag: ValidatorTag.MultiSelect})
          ],
          {...context?.schema, configTitle: 'props'}
        )
      },
      {
        title: '外观',
        body: [
          getSchemaTpl(
            'collapseGroup',
            [
              getSchemaTpl('style:formItem', {
                renderer: context.info.renderer,
                schema: [
                  {
                    label: '快捷编辑',
                    name: 'displayMode',
                    type: 'select',
                    pipeIn: defaultValue('base'),
                    options: [
                      {
                        label: '单侧按钮',
                        value: 'base'
                      },
                      {
                        label: '两侧按钮',
                        value: 'enhance'
                      }
                    ]
                  }
                ]
              }),
              getSchemaTpl('theme:form-label'),
              getSchemaTpl('theme:form-description'),
              {
                title: '数字输入框样式',
                body: [
                  ...inputStateTpl(
                    'themeCss.inputControlClassName',
                    'inputNumber.base.base'
                  )
                ]
              },
              getSchemaTpl('theme:cssCode', {
                themeClass: [
                  {
                    name: '数字输入框',
                    value: '',
                    className: 'inputControlClassName',
                    state: ['default', 'hover', 'active']
                  }
                ],
                isFormItem: true
              })
            ],
            {...context?.schema, configTitle: 'style'}
          )
        ]
      },
      {
        title: '事件',
        className: 'p-none',
        body: [
          getSchemaTpl('eventControl', {
            name: 'onEvent',
            ...getEventControlConfig(this.manager, context)
          })
        ]
      }
    ]);
  };
}

registerEditorPlugin(NumberControlPlugin);
