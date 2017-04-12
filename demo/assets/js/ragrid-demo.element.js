import { Observable }      from 'rxjs'
import { RxStore, Logger } from './rxstore'

export default class RagridDemo extends HTMLElement {
  createdCallback() {
    this.initial_state = {
      'direction':                  'columns'
    , 'horizontally-aligned':       'left'
    , 'horizontally-distributed':   'none'
    , 'vertically-aligned':         'top'
    , 'vertically-distributed':     'none'
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

    // new RxStore store from number seed, followed by object of reducers
    this.Ragrid = RxStore(this.initial_state, {
      update: patch => state => Object.assign({}, state, patch)
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

    this.reset$ = Observable.fromEvent(this, 'click')
      .filter(e => e.target.hasAttribute('ragrid-reset'))
      .subscribe(e => this.reset())
  }

  detachedCallback() {
    this.grid$.unsubscribe()
    this.align_panel$.unsubscribe()
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
          <pre>
# RAGrid HTML attributes
grid="${grid.direction}" 
horizontally-aligned="${grid['horizontally-aligned']}" 
vertically-aligned="${grid['vertically-aligned']}"
horizontally-distributed="${grid['horizontally-distributed']}" 
vertically-distributed="${grid['vertically-distributed']}"
          </pre>
          <div>
            <h2>Special Powers</h2>
            <button>Add A Box</button>
            <button>Reverse Order</button>
            <button>Baseline Align</button>
            <button ragrid-reset>Reset</button>
          </div>
        </nav>
        <article><section 
          grid="${grid.direction}" 
          horizontally-aligned="${grid['horizontally-aligned']}" 
          vertically-aligned="${grid['vertically-aligned']}"
          horizontally-distributed="${grid['horizontally-distributed']}" 
          vertically-distributed="${grid['vertically-distributed']}"
        >
          <div class="demo_box demo_box_offset_1"></div>
          <div class="demo_box"></div>
          <div class="demo_box demo_box_offset_2"></div>
          <div class="demo_box"></div>
        </section></article>
      </div>
    `
  }

  reset() {
    this.Ragrid.actions.update(this.initial_state)
  }
}

document.registerElement('ragrid-demo', RagridDemo)