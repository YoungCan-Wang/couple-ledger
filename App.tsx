import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Home from "./src/screens/Home";
import Ledger from "./src/screens/Ledger";
import AddEntry from "./src/screens/AddEntry";
import Todos from "./src/screens/Todos";
import Us from "./src/screens/Us";
import BottomNav from "./src/components/BottomNav";
import { useStore } from "./src/store";
import { isCloudBaseConfigured } from "./src/cloudbase";

const Tab = createBottomTabNavigator();

export default function App() {
  // 等 AsyncStorage 回填后再顺延待办、按已存账本 ID 重连（避免启动时读到空状态）
  useEffect(() => {
    const afterHydrate = () => {
      const st = useStore.getState();
      st.carryOverTodos();
      if (isCloudBaseConfigured && st.ledgerId.trim()) {
        st.connect();
      }
    };
    if (useStore.persist.hasHydrated()) {
      afterHydrate();
      return;
    }
    return useStore.persist.onFinishHydration(afterHydrate);
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <BottomNav {...props} />}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Ledger" component={Ledger} />
        <Tab.Screen name="Add" component={AddEntry} />
        <Tab.Screen name="Todos" component={Todos} />
        <Tab.Screen name="Us" component={Us} />
      </Tab.Navigator>
      <StatusBar style="dark" />
    </NavigationContainer>
  );
}
