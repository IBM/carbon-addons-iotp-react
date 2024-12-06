// eslint-disable-next-line import/no-extraneous-dependencies
import { addons } from '@storybook/addons';
// eslint-disable-next-line import/no-extraneous-dependencies
import { FORCE_RE_RENDER, STORY_RENDERED, STORY_CHANGED } from '@storybook/core-events';
import { isEqual } from 'lodash-es';

let callOrder = 0;
let states = [];
let dependencies = [];
let reRenderingQueued = false;

addons.getChannel().addListener(STORY_CHANGED, () => {
  // Clear the global state and reset the call order when
  // the user selects another story
  callOrder = 0;
  states = [];
  dependencies = [];
  reRenderingQueued = false;
});

addons.getChannel().addListener(STORY_RENDERED, () => {
  // Reset callOrder on every render so that the index of the useStoryState
  // doesn't keep increasing.
  callOrder = 0;
  // Reset reRenderingQueued once the story has been rendered
  reRenderingQueued = false;
});

/**
 * useStoryState can be used as a substitute for React's useState when you for
 * performance reasons don't want to wrap the story in a react element.
 * For more advanced stories it is also possible to add dependencies to the state
 * that when changed will force the state to use the value passed in (i.e. a new initial value)
 * and trigger a force rerender of the story to show the modified changes.
 *
 * Example 1
 * The dependencies can be a one or more knob values affecting the initial value like the Table's
 * 'hasLoadMore' affects the 'data' prop.
 *
 * Example 2
 * The dependencies can be the value of a knob representing the same table prop as the state does
 * so that that they can be used together, i.e. when the knob is modified the state
 * is also updated with the same value.
 * @param {any} initialValue The inital value of the state
 * @param {any} currentDep The dependencies that when changed will force a reset to the
 * initial value and re-render
 * @returns
 */
export default function useStoryState(initialValue, currentDep) {
  // The call order is the "id" used to link a stored state with the actual
  // call of the useStoryState function. The 'callOrder' const has to be reassigned
  // so that the update function can use the index matching this closure.
  const index = callOrder;

  // Set the value to the initialValue if this is the first render, if not
  // the value stays unchanged
  const isInitialRender = states[index] === undefined;
  const value = isInitialRender ? initialValue : states[index];
  states[index] = value;

  // If the dependencies has changed the state is "reset" to use the
  // new initial value and force a rerender of the story just like
  // a normal update would, thus the reset value is picked up during
  // next render
  const previousDep = dependencies[index];
  const dependenciesHasChanged = !isEqual(previousDep, currentDep);
  if (dependenciesHasChanged) {
    states[index] = initialValue;
    dependencies[index] = currentDep;
    if (!isInitialRender) {
      addons.getChannel().emit(FORCE_RE_RENDER);
    }
  }

  callOrder += 1;

  // The update function returned together with the value
  const update = (newValue) => {
    states[index] = typeof newValue === 'function' ? newValue(states[index]) : newValue;

    if (!reRenderingQueued) {
      // Prevent multiple forced rerender calls if there are multiple states
      // updateded in the same cycle.
      reRenderingQueued = true;
      addons.getChannel().emit(FORCE_RE_RENDER);
    }
  };

  return [value, update];
}
