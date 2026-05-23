import { useUserStore } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

function AndroidTabLayout() {
    const isAdmin = useUserStore(state => state.isAdmin)
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => {
                        return <Ionicons name='home' color={color} size={size} />
                    }
                }}
            />
            <Tabs.Screen name="search"
                options={{
                    title: 'Search',
                    tabBarIcon: ({ color, size }) => {
                        return <Ionicons name='search' color={color} size={size} />
                    }
                }}
            />
            {isAdmin &&
                <Tabs.Screen name="create"
                    options={{
                        title: 'Create',
                        tabBarIcon: ({ color, size }) => {
                            return <Ionicons name='add-circle' color={color} size={size} />
                        }
                    }}
                />
            }
            <Tabs.Screen name="save"
                options={{
                    title: 'Save',
                    tabBarIcon: ({ color, size }) => {
                        return <Ionicons name='heart' color={color} size={size} />
                    }
                }}
            />
            <Tabs.Screen name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => {
                        return <Ionicons name='person' color={color} size={size} />
                    }
                }}
            />
        </Tabs>
    );
}
function IosTabLayout() {
    const isAdmin = useUserStore(state => state.isAdmin)
    return (
        <NativeTabs>
            <NativeTabs.Trigger name="index">
                <Label>Home</Label>
                <Icon sf="house.fill" drawable="custom_android_drawable" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="search">
                <Icon sf="magnifyingglass" drawable="custom_settings_drawable" />
                <Label>Search</Label>
            </NativeTabs.Trigger>

            {isAdmin &&
                <NativeTabs.Trigger name="create">
                    <Icon sf="plus.circle.fill" drawable="custom_settings_drawable" />
                    <Label>Create</Label>
                </NativeTabs.Trigger>
            }

            <NativeTabs.Trigger name="save">
                <Icon sf="heart.fill" drawable="custom_settings_drawable" />
                <Label>Save</Label>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="profile">
                <Icon sf="person.fill" drawable="custom_settings_drawable" />
                <Label>Profile</Label>
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}

export default function TabLayout() {
    return Platform.OS === "android" ? <AndroidTabLayout /> : <IosTabLayout />
}

