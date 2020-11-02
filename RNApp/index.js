import { Navigation } from "react-native-navigation"
import {AppRegistry} from 'react-native'
import Home from './src/view/screens/Home'
import {name as appName} from './app.json'

AppRegistry.registerComponent(appName, () => Home)
Navigation.registerComponent('home', () => Home)

Navigation.events().registerAppLaunchedListener(() => {
   Navigation.setRoot({
     root: {
       stack: {
         children: [
           {
             component: {
               name: 'home',
               options: {
                topBar: {
                    visible: false,
                    title: {
                      text: 'Home',
                      color: 'white'
                    },
                    background: {
                      color: '#4d089a'
                    }
                  }
               }
             }
           }
         ]
       }
     }
  })
})