import React, { Component } from 'react';
import { StyleSheet, Text, View, ListView, RefreshControl } from 'react-native';
import { fetchLights } from 'simple-hue-library';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

const API_URL = 'http://54.197.187.61';
const API_USERNAME = 'newdeveloper';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: null
    };
  }

  componentWillMount() {
    fetchLights(API_URL, API_USERNAME)
      .then((response) => {
        this.createDataSource(response);
      });
  }

  createDataSource = (data) => {
    const ds = new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2
    });

    this.setState({
        dataSource: ds.cloneWithRows(data),
    });
  }

  renderRow = (row) => {
    const brightness = 200 - (((row.brightness > 100) ? 100 : row.brightness) * 2);
    const lightbulb = (row.on) ? 'lightbulb' : 'lightbulb-outline';
    const backgroundColor = (row.on) ? `rgb(255, 255, ${brightness})` : `rgb(0, 0, 0)`

    return (
      <View style={[styles.rowContainer]}>
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
      </View>
    );
  }

  render() {
    if (this.state.dataSource === null) return null;

    return (
      <View style={styles.container}>
        <ListView
            dataSource={this.state.dataSource}
            enableEmptySections
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
  }
});
