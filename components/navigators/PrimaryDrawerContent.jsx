import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

function PrimaryDrawerContent(props) {
    return (
        <DrawerContentScrollView {...props} scrollEnabled={false}  contentContainerStyle={{ flex: 1 }}>
            <View style={styles.userContainer}>
                <Text>Primary Drawer Content</Text>
            </View>

            <DrawerItemList {...props}></DrawerItemList>
        </DrawerContentScrollView>
    )
}

const styles = StyleSheet.create({
    userContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
})

export default PrimaryDrawerContent
