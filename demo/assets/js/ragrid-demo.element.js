import { Observable }      from 'rxjs'
import { RxStore, Logger } from './rxstore'

export default class RagridDemo extends HTMLElement {
  createdCallback() {
    this.controls = [
      {
        buttons:  [
          { attr: 'horizontally-aligned', val: 'left' }
        , { attr: 'horizontally-aligned', val: 'center' }
        , { attr: 'horizontally-aligned', val: 'right' }
        , { attr: 'vertically-aligned',   val: 'top' }
        , { attr: 'vertically-aligned',   val: 'center' }
        , { attr: 'vertically-aligned',   val: 'bottom' }
        ],
      },
      {
        buttons:  [
          { attr: 'horizontally-distributed', val: 'around' }
        , { attr: 'horizontally-distributed', val: 'between' }
        , { attr: 'horizontally-distributed', val: 'equal' }
        , { attr: 'vertically-distributed',   val: 'around' }
        , { attr: 'vertically-distributed',   val: 'between' }
        , { attr: 'vertically-distributed',   val: 'equal' }
        ],
      },
      {
        buttons: [
          { attr: 'direction', val: 'rows' }
        , { attr: 'direction', val: 'columns' }
        ]
      }
    ]

    // new RxStore store from number seed, followed by object of reducers
    this.Ragrid = RxStore({
      'direction':                  'columns'
    , 'horizontally-aligned':       'left'
    , 'horizontally-distributed':   'none'
    , 'vertically-aligned':         'top'
    , 'vertically-distributed':     'none'
    }, {
      set: incoming => state => Object.assign({}, state, incoming)
    })
    // opt into nice state change logs
    Logger('RagridDemo', this.Ragrid.store$)
  }

  attachedCallback() {
    // our observable number to render on changes
    this.grid$ = this.Ragrid.store$.subscribe(grid => this.render(grid))
    
    this.clicks$ = Observable.fromEvent(this, 'click')
      .filter(e => e.target.hasAttribute('data-attr-key'))
      .map(e => {
        let new_state = {}
        new_state[e.target.dataset.attrKey] = e.target.dataset.attrVal
        return new_state
      })
      .subscribe(action => this.Ragrid.actions.set(action))
  }

  detachedCallback() {
    this.grid$.unsubscribe()
    this.clicks$.unsubscribe()
  }

  attributeChangedCallback(attr, oldVal, newVal) {}
  
  render(grid) {
    this.innerHTML = `
      <div grid="columns">
        <nav>
          ${this.controls.reduce((controls, control) => 
            `${controls}
            <div class="controls" grid="rows" vertically-distributed="equal">
              <div grid="columns" horizontally-distributed="equal">
                ${control.buttons.reduce((items, item) => 
                  `${items}<button data-attr-key="${item.attr}" data-attr-val="${item.val}"></button>`
                , '')}
              </div>
            </div>
            `
          , '')}
          <img src="https://helpx.adobe.com/muse/using/using-align-panel-objects/_jcr_content/main-pars/procedure/proc_par/step_1/step_par/image.img.png/alignpanel.PNG"/>
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
}

document.registerElement('ragrid-demo', RagridDemo)