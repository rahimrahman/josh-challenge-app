import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ListView,
    RefreshControl,
    Modal,
    TouchableOpacity,
    Platform,
    Switch,
    Slider,
    PixelRatio
} from 'react-native';
import { fetchLights, updateLight } from 'simple-hue-library';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

const API_URL = 'http://54.197.187.61';
const API_USERNAME = 'newdeveloper';
const PlatformIOS = Platform.OS === 'ios';

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedLight: {},
            dataSource: null,
            showLightModal: false,
            refreshing: false
        };
    }

    componentWillMount() {
        this.fetchLightsFromServer();
    }

    fetchLightsFromServer = () => {
        fetchLights(API_URL, API_USERNAME)
            .then((response) => {
                this.setState({ lights: response, refreshing: false });
                this.createDataSource(response);
            });
    }

    updateLightToServer = () => {
        const { id, on, brightness } = this.state.selectedLight;
        const updateBody = {
            on,
            bri: brightness
        };
        updateLight(API_URL, API_USERNAME, id, updateBody)
            .then(() => {
                this.fetchLightsFromServer();
                this.setState({ showLightModal: false });
            })
    }

    createDataSource = (data) => {
        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        });

        this.setState({
            dataSource: ds.cloneWithRows(data),
        });
    }

    onActionButtonPress = () => {
        this.setState({ showLightModal: false })
    }

    onDismissButtonPress = () => {
        this.setState({ showLightModal: false })
    }

    onLightRowPress = (rowData) => {
        this.setState({ selectedLight: rowData }, () => {
            this.setState({ showLightModal: true })
        });
    }

    onLightSwitchChange = (lightStatus) => {
        const light = this.state.selectedLight;
        light.on = lightStatus;
        this.setState({ selectedLight: light })
    }

    onLightSwitchBrightnessChange = (value) => {
        const light = this.state.selectedLight;
        light.brightness = value;
        this.setState({ selectedLight: light })
    }

    onRefresh = () => {
        this.setState({ refreshing: true });
        this.fetchLightsFromServer();
    }

    upperCaseButtonTextIfNeeded = (buttonText) => {
        return PlatformIOS ? buttonText : buttonText.toUpperCase();
    }

    getLightModifiedData = (light) => {
        const lightOriginalBrightness = ((light.brightness > 100) ? 100 : light.brightness);
        const brightness = 200 - (lightOriginalBrightness * 2);
        const lightbulb = (light.on) ? 'lightbulb' : 'lightbulb-outline';
        const backgroundColor = (light.on) ? `rgb(255, 255, ${brightness})` : `rgb(0, 0, 0)`;

        return { lightOriginalBrightness, brightness, lightbulb, backgroundColor }
    }

    renderModalView = () => {
        const light = this.state.selectedLight;

        const { lightOriginalBrightness, brightness, lightbulb, backgroundColor } = this.getLightModifiedData(light);
        const containerPlatformStyle = PlatformIOS ? { justifyContent: 'space-between' } : { paddingTop: 15 };
        const buttonPlatformStyle = PlatformIOS ? { flex: 1, height: 45, justifyContent: 'center' } : {};
        
        return (
            <View style={styles.modalViewContainer}>
                <View style={styles.innerModal}>
                    <Text>{light.name}</Text>
                    <View>
                        <Icon
                            name={lightbulb}
                            size={120}
                            style={{ color: `${backgroundColor}` }}
                        />
                    </View>
                    <View>
                        <Switch
                            value={light.on}
                            onValueChange={(lightStatus) => this.onLightSwitchChange(lightStatus)}
                            tintColor={'#d3d3d3'}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Slider
                            minimumValue={0}
                            maximumValue={100}
                            value={lightOriginalBrightness}
                            onValueChange={(value) => this.onLightSwitchBrightnessChange(value)}
                            step={1}
                            style={{ width: 200 }}
                        />
                        <Text>{lightOriginalBrightness}</Text>
                    </View>
                    {PlatformIOS && <View style={styles.lineSeparator} />}
                    <View style={[{ alignSelf: 'stretch', flexDirection: 'row' }, containerPlatformStyle]}>
                        {!PlatformIOS && <View style={{ flex: 1 }} />}
                        <TouchableOpacity
                            onPress={() => this.onDismissButtonPress()}
                            style={buttonPlatformStyle}
                        >
                            <Text style={[styles.button, { paddingRight: 10 }]}>
                                {this.upperCaseButtonTextIfNeeded('Close')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.updateLightToServer()}
                            style={buttonPlatformStyle}
                        >
                            <Text style={[styles.button, { opacity: 1 }]}>
                                {this.upperCaseButtonTextIfNeeded('Save')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )

    }

    renderRow = (row) => {
        const { lightOriginalBrightness, brightness, lightbulb, backgroundColor } = this.getLightModifiedData(row);
        
        return (
            <TouchableOpacity
                onPress={() => this.onLightRowPress(row)}
                style={[styles.rowContainer]}
            >
                <View style={{ flex: 2 }}>
                    <Text style={styles.row}>{JSON.stringify(row, null, 4)}</Text>
                </View>
                <View style={styles.lightBulbContainer}>
                    <Icon
                        name={lightbulb}
                        size={60}
                        style={{ color: `${backgroundColor}` }}
                    />
                </View>
            </TouchableOpacity>
        );
    }

    render() {
        if (this.state.dataSource === null) return null;

        return (
            <View style={styles.container}>
                <Modal
                    animationType='fade'
                    onRequestClose={() => this.onDismissButtonPress()}
                    transparent
                    visible={this.state.showLightModal}
                >
                    {this.renderModalView()}
                </Modal>
                <ListView
                    dataSource={this.state.dataSource}
                    enableEmptySections
                    refreshControl={
                        <RefreshControl
                            onRefresh={() => this.onRefresh()}
                            refreshing={this.state.refreshing}
                        />
                    }
                    renderRow={this.renderRow}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 20
    },
    rowContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        flexDirection: 'row',
        borderBottomColor: '#d3d3d3',
        borderBottomWidth: 1
    },
    row: {
        fontFamily: 'Helvetica Neue',
        fontSize: 16,
    },
    lightBulbContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#d3d3d3'
    },
    modalViewContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 30,
    },
    innerModal: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingTop: 20,
        paddingBottom: PlatformIOS ? 0 : 20,
        paddingHorizontal: 20,
        alignSelf: 'stretch',
        alignItems: 'center',
        margin: 20,
        borderRadius: PlatformIOS ? 8 : 2
    },
    sliderTrack: {
        height: 2,
        backgroundColor: '#303030',
    },
    lineSeparator: {
        height: 1 / PixelRatio.get(),
        backgroundColor: '#d5d5d5',
        marginLeft: -20,
        marginRight: -20,
        marginTop: 20
    },
    button: {
        fontSize: 16,
        color: '#007aff',
        textAlign: 'center'
    },
});
