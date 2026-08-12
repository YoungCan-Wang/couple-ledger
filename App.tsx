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
import { isFirebaseConfigured } from "./src/firebase";

const Tab = createBottomTabNavigator();

export default function App() {
  const carryOver = useStore((s) => s.carryOverTodos);

  // 打开 App 时把"昨天没完成"的待办顺延到今天
  useEffect(() => {
    carryOver();
  }, [carryOver]);

  // 若已配置 Firebase 且存有账本 ID，则自动重连云端同步
  useEffect(() => {
    const st = useStore.getState();
    if (isFirebaseConfigured && st.ledgerId.trim() && st.syncStatus === "local") {
      st.connect();
    }
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
