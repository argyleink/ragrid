import { Observable }      from 'rxjs'
import { RxStore, Logger } from './rxstore'

export default class RagridDemo extends HTMLElement {
  createdCallback() {
    this.initial_state = {
      'horizontally-aligned':       'left'
    , 'vertically-aligned':         'top'
    , 'horizontally-distributed':   'none'
    , 'vertically-distributed':     'none'
    , direction:                    'columns'
    , order:                        'forward'
    , height:                       '50vh'
    , boxes:                        4
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
      { attr:   'order'
      , val:    'forward'
      , title:  'Forward the order'
      , text:   'Forward'
      }
    , { attr:   'order'
      , val:    'reverse'
      , title:  'Reverse the order'
      , text:   'Reverse'
      }
    , { attr:   'vertically-aligned'
      , val:    'baseline'
      , title:  'Align to the box contents text baseline'
      , text:   'Baseline Align'
      }
    ]

    // Create a store for our demo state
    this.Ragrid = RxStore(this.initial_state, {
      update: patch => state => Object.assign({}, state, patch)
    , add_box: () => state => Object.assign({}, state, {boxes: state.boxes + 1})
    , set_height: height => state => Object.assign({}, state, {height})
    })

    // opt into nice state change logs
    Logger('RagridDemo', this.Ragrid.store$)
  }

  attachedCallback() {
    // our observable number to render on changes
    this.grid$ = this.Ragrid.store$.subscribe(grid => this.render(grid))
    
    this.align_panel$ = Observable.fromEvent(this, 'click')
      .filter(e => e.target.hasAttribute('data-attr-key'))
      .map(e => {
        let new_state = {}
        new_state[e.target.dataset.attrKey] = e.target.dataset.attrVal
        return new_state
      })
      .subscribe(patch => this.Ragrid.actions.update(patch))

    this.add$ = Observable.fromEvent(this, 'click')
      .filter(e => e.target.hasAttribute('ragrid-add'))
      .subscribe(e => this.Ragrid.actions.add_box())

    this.height$ = Observable.fromEvent(this, 'click')
      .filter(e => e.target.hasAttribute('ragrid-auto-height'))
      .subscribe(e => this.Ragrid.actions.set_height())

    this.reset$ = Observable.fromEvent(this, 'click')
      .filter(e => e.target.hasAttribute('ragrid-reset'))
      .subscribe(e => this.Ragrid.actions.update(this.initial_state))
  }

  detachedCallback() {
    this.grid$.unsubscribe()
    this.align_panel$.unsubscribe()
    this.add$.unsubscribe()
    this.reset$.unsubscribe()
  }

  attributeChangedCallback(attr, oldVal, newVal) {}
  
  render(grid) {
    this.innerHTML = `
      <div grid="columns">
        <nav>
          <div class="align-panel">
            ${this.panel_controls.reduce((controls, control) => 
              `${controls}
              <div class="controls ${control.section}" grid="rows" vertically-distributed="equal">
                <div grid="columns" horizontally-distributed="equal">
                  ${control.buttons.reduce((items, item) => 
                    `${items}<button data-attr-key="${item.attr}" data-attr-val="${item.val}" title="${item.title}"></button>`
                  , '')}
                </div>
              </div>
              `
            , '')}
            <img src="https://helpx.adobe.com/muse/using/using-align-panel-objects/_jcr_content/main-pars/procedure/proc_par/step_1/step_par/image.img.png/alignpanel.PNG"/>
          </div>
          <h4>RAGrid attributes:</h4>
          <pre>
grid="${grid.direction}" 
horizontally-aligned="${grid['horizontally-aligned']}" 
vertically-aligned="${grid['vertically-aligned']}"
horizontally-distributed="${grid['horizontally-distributed']}" 
vertically-distributed="${grid['vertically-distributed']}"
order="${grid['order']}"
          </pre>
          <div class="feature">
            <h5>Align Panel can't do this:</h5>
            ${this.controls.reduce((items, item) => 
              `${items}
               <button data-attr-key="${item.attr}" data-attr-val="${item.val}" title="${item.title}">${item.text}</button>`
            , '')}
          </div>
          <div class="feature">
            <h5>Demo Controls:</h5>
            <button ragrid-reset>Reset</button>
            <button ragrid-add>Add Box</button>
            <button ragrid-auto-height>Auto Height Container</button>
          </div>
        </nav>
        <article><section 
          style="min-height:${grid.height};"
          grid="${grid.direction}" 
          horizontally-aligned="${grid['horizontally-aligned']}" 
          vertically-aligned="${grid['vertically-aligned']}"
          horizontally-distributed="${grid['horizontally-distributed']}" 
          vertically-distributed="${grid['vertically-distributed']}"
          order="${grid['order']}"
        >
          ${Array.apply(null, {length:grid.boxes}).reduce((boxes, box) => 
            `${boxes}<div class="demo_box"></div>`
          , '')}
        </section></article>
      </div>
    `
  }
}

document.registerElement('ragrid-demo', RagridDemo)