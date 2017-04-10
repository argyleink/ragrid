import { Subject, BehaviorSubject } from 'rxjs'

export function RxStore(initial_state, reducers) {
  let streams = {}, actions = {}, store$
  
  for (let action in reducers) {
    let subject$            = new Subject()
    streams[`${action}$`]   = subject$.map(reducers[action])
    actions[action]         = (...args) => subject$.next(...args)
  }

  store$ = new BehaviorSubject(initial_state)
    .merge(...Object.values(streams))
    .scan((state, reducer) => reducer(state))
  
  return {store$, actions}
}

export function Logger(prefix, observable) {
  return observable.scan((prevState, nextState) => {
    console.groupCollapsed(`${prefix}:`)

    console.log(`%c prev state:`, `color: #999999; font-weight: bold`, prevState)
    console.log(`%c next state:`, `color: #4CAF50; font-weight: bold`, nextState)

    console.groupEnd()
    return nextState
  }).subscribe()
}