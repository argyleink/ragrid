import { Observable }       from 'rxjs'
import { RxStore, Logger }  from './rxstore'
import { 
  h
, diff
, patch }                   from 'virtual-dom'
import * as createElement   from 'virtual-dom/create-element'
import * as Prism           from 'prismjs'

export default class RagridDemo extends HTMLElement {
  createdCallback() {
    this.initial_state = {
      'horizontally-aligned':       ''
    , 'vertically-aligned':         ''
    , 'horizontally-distributed':   ''
    , 'vertically-distributed':     ''
    , direction:                    'columns'
    , order:                        ''
    , minHeight:                    '500px'
    , maxHeight:                    ''
    , width:                        '3'
    , boxes:                        4
    }

    this.masonry = {
      boxes                   : 8
    , minHeight               : '500px'
    , maxHeight               : '90vh'
    , 'horizontally-aligned'  : 'left'
    , 'vertically-aligned'    : 'center'
    }

    this.panel_controls = [
      {
        section: 'align-objects',
        buttons:  [
          { attr: 'horizontally-aligned', val: 'left',    title: 'Horizontally align to the left' }
        , { attr: 'horizontally-aligned', val: 'center',  title: 'Horizontally align to the center' }
        , { attr: 'horizontally-aligned', val: 'right',   title: 'Horizontally align to the right' }
        , { attr: 'vertically-aligned',   val: 'top',     title: 'Vertically align to the top' }
        , { attr: 'vertically-aligned',   val: 'center',  title: 'Vertically align to the center' }
        , { attr: 'vertically-aligned',   val: 'bottom',  title: 'Vertically align to the bottom' }
        ],
      },
      {
        section: 'distribute-objects',
        buttons:  [
          { attr: 'horizontally-distributed', val: 'between', title: 'Horizontally distribute space between, edge to edge' }
        , { attr: 'horizontally-distributed', val: 'around',  title: 'Horizontally distribute space evenly' }
        , { attr: 'horizontally-distributed', val: 'equal',   title: 'Horizontally fill all space' }
        , { attr: 'vertically-distributed',   val: 'between', title: 'Vertically distribute space between, edge to edge' }
        , { attr: 'vertically-distributed',   val: 'around',  title: 'Vertically distribute space evenly' }
        , { attr: 'vertically-distributed',   val: 'equal',   title: 'Vertically fill all space' }
        ],
      },
      {
        section: 'distribute-spacing',
        buttons: [
          { attr: 'direction', val: 'rows',     title: 'Rows' }
        , { attr: 'direction', val: 'columns',  title: 'Columns' }
        ]
      }
    ]

    this.controls = [
      { attr:   'direction'
      , val:    'masonry'
      , title:  'Pack them in'
      , text:   'Masonry'
      }
    , { attr:   'direction'
      , val:    'masonry'
      , title:  'Pack them in from the bottom'
      , text:   'Bottom Up Masonry'
      }
    , { attr:   'horizontally-distributed'
      , val:    ''
      , title:  'Don\'t horizontally distribute'
      , text:   'No Horizontal Distribution'
      }
    , { attr:   'vertically-distributed'
      , val:    ''
      , title:  'Don\'t vertically distribute'
      , text:   'No Vertical Distribution'
      }
    , { attr:   'order'
      , val:    'reverse'
      , title:  'Reverse the order'
      , text:   'Reverse'
      }
    , { attr:   'order'
      , val:    'forward'
      , title:  'Forward the order'
      , text:   'Forward'
      }
    , { attr:   'vertically-aligned'
      , val:    'baseline'
      , title:  'Align to the box contents text baseline'
      , text:   'Baseline Align'
      }
    ]

    // Create an observable for our demo element's state
    this.Ragrid = RxStore(this.initial_state, {
      update:           patch =>      state => Object.assign({}, state, patch)
    , add_box:          () =>         state => Object.assign({}, state, {boxes: state.boxes + 1})
    , set_minHeight:    minHeight =>  state => Object.assign({}, state, {minHeight})
    , set_width:        width =>      state => Object.assign({}, state, {width})
    })

    // opt into nice state change logs
    Logger('RagridDemo', this.Ragrid.store$)

    // vdom for minimal element touches
    this.tree     = this.vdom(this.initial_state)
    this.rootNode = createElement(this.tree)
    this.appendChild(this.rootNode)

    // syntax highlight code
    Prism.highlightElement(this.querySelector('code'))
  }

  attachedCallback() {
    // our observable number to render on changes
    this.grid$ = this.Ragrid.store$.subscribe(grid => this.render(grid))
    
    // stream of clicks on this element
    this.clicks$ = Observable.fromEvent(this, 'click')

    this.align_panel$ = this.clicks$
      .filter(e => e.target.hasAttribute('data-attr-key'))
      .map(e => {
        let new_state = {}
        new_state[e.target.dataset.attrKey] = e.target.dataset.attrVal

        // set masonry custom attributes
        if (e.target.dataset.attrVal == 'masonry')
          new_state = Object.assign(new_state, this.masonry)

        // set bottom up masonry attributes
        if (e.target.innerText == 'Bottom Up Masonry')
          new_state['horizontally-aligned'] = 'right'
        
        // set row settings 
        if (e.target.dataset.attrVal == 'rows')
          new_state.maxHeight = '90vh'

        return new_state
      })
      .subscribe(patch => this.Ragrid.actions.update(patch))

    this.add$ = this.clicks$
      .filter(e => e.target.hasAttribute('ragrid-add'))
      .subscribe(e => this.Ragrid.actions.add_box())

    this.height$ = this.clicks$
      .filter(e => e.target.hasAttribute('ragrid-auto-height'))
      .subscribe(e => this.Ragrid.actions.set_minHeight())

    this.width$ = this.clicks$
      .filter(e => e.target.hasAttribute('ragrid-auto-width'))
      .subscribe(e => this.Ragrid.actions.set_width())

    this.reset$ = this.clicks$
      .filter(e => e.target.hasAttribute('ragrid-reset'))
      .subscribe(e => this.Ragrid.actions.update(this.initial_state))
  }

  detachedCallback() {
    this.grid$.unsubscribe()
    this.clicks$.unsubscribe()
  }

  attributeChangedCallback(attr, oldVal, newVal) {}

  vdom(grid) {
    return h('div', [
      h('code.language-markup', { id: 'demo' }, `
        <div
          grid="${grid.direction}"
          ${ (grid['horizontally-aligned'] ? 'horizontally-aligned="' + grid['horizontally-aligned'] + '"' : '')}
          ${ (grid['vertically-aligned'] ? 'vertically-aligned="' + grid['vertically-aligned'] + '"' : '')}
          ${ (grid['horizontally-distributed'] ? 'horizontally-distributed="' + grid['horizontally-distributed'] + '"' : '')} 
          ${ (grid['vertically-distributed'] ? 'vertically-distributed="' + grid['vertically-distributed'] + '"' : '')}
          ${ (grid['order'] ? 'order="' + grid['order'] + '"' : '')}
        >…</div>
      `)
    , h('div', {
        attributes: {
          grid: 'columns'
        }
      }, 
      [
        h('nav', [
          h('.align-panel', [
            this.panel_controls.map(control =>
              h(`.controls.${control.section}`, { attributes: {
                grid: 'columns'
              , 'horizontally-distributed': 'equal'
              }}, control.buttons.map(btn => 
                h('button', { attributes: {
                  'data-attr-key':    btn.attr
                , 'data-attr-val':    btn.val
                , 'title':            btn.title
                }})
              ))
            )
          , h('img', { src: 'https://helpx.adobe.com/muse/using/using-align-panel-objects/_jcr_content/main-pars/procedure/proc_par/step_1/step_par/image.img.png/alignpanel.PNG' })
          ])
        , h('.feature', [
            h('h4', 'Align Panel can\'t do this:')
          , this.controls.map(btn => h('button', { attributes: {
              'data-attr-key':    btn.attr
            , 'data-attr-val':    btn.val
            , 'title':            btn.title
            }}, btn.text))
          ])
        , h('.feature', [
            h('h4', 'Demo Controls:')
          , h('button', { attributes: {
              'ragrid-reset': '' 
            }}, 'Reset')
          , h('button', { attributes: {
              'ragrid-add': '' 
            }}, 'Add Box')
          , h('button', { attributes: {
              'ragrid-auto-height': '' 
            }}, 'Auto Height Container')
          , h('button', { attributes: {
              'ragrid-auto-width': '' 
            }}, 'Auto Width Container')
          ])
        ])
      , h('article', {
          style: {
            flex: grid.width
          }
        }, [
          h('section', {
            style: {
              'min-height': grid.minHeight
            , 'max-height': grid.maxHeight
            },
            attributes: {
              grid:                     grid.direction
            , order:                    grid.order
            , 'vertically-aligned':     grid['vertically-aligned']
            , 'horizontally-aligned':   grid['horizontally-aligned']
            , 'vertically-distributed': grid['vertically-distributed']
            , 'horizontally-aligned':   grid['horizontally-aligned']
            }
          }, 
          Array.apply(null, {length:grid.boxes}).map(box => h('.demo_box'))
        )])
      ])
    ])
  }
  
  render(grid) {
    let newTree     = this.vdom(grid)
    let patches     = diff(this.tree, newTree)
    this.rootNode   = patch(this.rootNode, patches)
    this.tree       = newTree
  }
}

document.registerElement('ragrid-demo', RagridDemo)