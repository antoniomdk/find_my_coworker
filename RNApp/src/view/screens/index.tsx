import * as React from 'react';
import { Provider } from 'react-redux';
import { Navigation } from 'react-native-navigation';

import { SCREENS } from '../../constants/screen';
import * as Home from './Home';
import * as Settings from './Settings';
import * as Drawer from './Drawer';

const registerComponentWithRedux = (redux: any) => (
  name: string,
  screen: any,
) => {
  Navigation.registerComponent(
    name,
    () => (props: any) => (
      <Provider store={redux.store}>
        <screen.default {...props} />
      </Provider>
    ),
    () => screen.default);
};

export function registerScreens(redux: any) {
  registerComponentWithRedux(redux)(SCREENS.Home, Home)
  registerComponentWithRedux(redux)(SCREENS.Settings, Settings)
  registerComponentWithRedux(redux)(SCREENS.Drawer, Drawer)
}
