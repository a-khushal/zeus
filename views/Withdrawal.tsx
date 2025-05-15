import * as React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { inject } from 'mobx-react';
import { Route } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import Amount from '../components/Amount';
import Header from '../components/Header';
import KeyValue from '../components/KeyValue';
import Screen from '../components/Screen';
import Button from '../components/Button';
import { Row } from '../components/layout/Row';

import Invoice from '../models/Invoice';

import { localeString } from '../utils/LocaleUtils';
import { themeColor } from '../utils/ThemeUtils';

import EditNotes from '../assets/images/SVG/Pen.svg';
import QR from '../assets/images/SVG/QR.svg';
import Storage from '../storage';

interface WithdrawalProps {
    navigation: StackNavigationProp<any, any>;
    route: Route<'WithdrawalView', { withdrawalRequest: Invoice }>;
}

interface WithdrawalState {
    storedNote: string;
    invreq_time: string | null;
}

@inject('InvoicesStore')
export default class WithdrawalView extends React.Component<
    WithdrawalProps,
    WithdrawalState
> {
    state = {
        storedNote: '',
        invreq_time: null
    };

    async componentDidMount() {
        const { route, navigation } = this.props;
        const withdrawalRequest = route.params?.withdrawalRequest;

        navigation.addListener('focus', () => {
            const note = withdrawalRequest.getNote;
            this.setState({ storedNote: note });
        });

        if (withdrawalRequest.bolt12) {
            const timestamp = await Storage.getItem(
                `withdrawalRequest_${withdrawalRequest.bolt12}`
            );
            if (!timestamp) {
                this.setState({
                    storedNote: withdrawalRequest.getNote
                });
            } else {
                const dateTime = new Date(Number(JSON.parse(timestamp)));
                const invreq_time = dateTime.toString();
                this.setState({
                    storedNote: withdrawalRequest.getNote,
                    invreq_time
                });
            }
        }
    }

    render() {
        const { navigation, route } = this.props;
        const { storedNote } = this.state;
        const withdrawalRequest = route.params?.withdrawalRequest;
        const {
            getNoteKey,
            getAmount,
            invreq_id,
            active,
            single_use,
            used,
            bolt12
        } = withdrawalRequest;
        const QRButton = () => (
            <TouchableOpacity
                onPress={() =>
                    navigation.navigate('QR', {
                        value: bolt12,
                        satAmount: getAmount
                    })
                }
            >
                <QR fill={themeColor('text')} style={{ alignSelf: 'center' }} />
            </TouchableOpacity>
        );
        const EditNotesButton = () => (
            <TouchableOpacity
                onPress={() =>
                    navigation.navigate('AddNotes', {
                        noteKey: getNoteKey
                    })
                }
                style={{ marginRight: 15 }}
            >
                <EditNotes
                    fill={themeColor('text')}
                    style={{ alignSelf: 'center' }}
                />
            </TouchableOpacity>
        );

        return (
            <Screen>
                <Header
                    leftComponent="Back"
                    centerComponent={{
                        text: localeString('general.withdrawalRequest'),
                        style: {
                            color: themeColor('text'),
                            fontFamily: 'PPNeueMontreal-Book'
                        }
                    }}
                    rightComponent={
                        <Row>
                            <EditNotesButton />
                            <QRButton />
                        </Row>
                    }
                    navigation={navigation}
                />
                <ScrollView keyboardShouldPersistTaps="handled">
                    <View style={styles.center}>
                        <Amount
                            sats={(
                                Number(withdrawalRequest.invreq_amount_msat) /
                                1000
                            ).toString()}
                            sensitive
                            jumboText
                            toggleable
                        />
                    </View>

                    <View style={styles.content}>
                        <KeyValue
                            keyValue={localeString(
                                'views.PaymentRequest.description'
                            )}
                            value={withdrawalRequest.offer_description}
                            sensitive
                            color={themeColor('text')}
                        />

                        <KeyValue
                            keyValue={localeString('general.active')}
                            value={
                                active
                                    ? localeString('general.true')
                                    : localeString('general.false')
                            }
                            sensitive
                        />

                        <KeyValue
                            keyValue={localeString('views.PayCode.singleUse')}
                            value={
                                single_use
                                    ? localeString('general.true')
                                    : localeString('general.false')
                            }
                            sensitive
                        />

                        <KeyValue
                            keyValue={localeString('general.used')}
                            value={
                                used
                                    ? localeString('general.true')
                                    : localeString('general.false')
                            }
                            sensitive
                        />

                        {this.state.invreq_time && (
                            <KeyValue
                                keyValue={localeString(
                                    'views.NodeInfo.ForwardingHistory.timestamp'
                                )}
                                value={this.state.invreq_time}
                                sensitive
                            />
                        )}

                        <KeyValue
                            keyValue={localeString('views.withdrawal.id')}
                            value={invreq_id}
                            sensitive
                            color={themeColor('text')}
                        />

                        <KeyValue
                            keyValue={localeString('views.PayCode.bolt12')}
                            value={bolt12}
                            sensitive
                            color={themeColor('text')}
                        />

                        {storedNote && (
                            <KeyValue
                                keyValue={localeString('general.note')}
                                value={storedNote}
                                sensitive
                                mempoolLink={() =>
                                    navigation.navigate('AddNotes', {
                                        noteKey: getNoteKey
                                    })
                                }
                            />
                        )}
                    </View>
                </ScrollView>
                <View style={{ bottom: 15 }}>
                    {getNoteKey && (
                        <Button
                            title={
                                storedNote
                                    ? localeString(
                                          'views.SendingLightning.UpdateNote'
                                      )
                                    : localeString(
                                          'views.SendingLightning.AddANote'
                                      )
                            }
                            onPress={() =>
                                navigation.navigate('AddNotes', {
                                    noteKey: getNoteKey
                                })
                            }
                            containerStyle={{ marginTop: 15 }}
                            noUppercase
                        />
                    )}
                </View>
            </Screen>
        );
    }
}

const styles = StyleSheet.create({
    content: {
        paddingLeft: 20,
        paddingRight: 20
    },
    center: {
        alignItems: 'center',
        paddingTop: 15,
        paddingBottom: 15
    }
});
