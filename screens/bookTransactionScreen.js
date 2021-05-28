import React from 'react';
import {Text,View,StyleSheet,TouchableOpacity,TextInput,KeyboardAvoidingView,ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../config'

export default class TransactionScreen extends React.Component {
constructor() {

    super()
    this.state = {

        hasCameraPermissions:null,
        scanned:false,
        scannedBookId:'',
        scannedStudentId:'',
        buttonState:'normal',
        transactionMessage:''
    }
}

getCameraPermissions = async(Id) => {

      const {status} = await Permissions.askAsync(Permissions.CAMERA)
      this.setState({

        hasCameraPermissions:status==="granted",
        buttonState:Id,
        scanned:false
      })
}

handleBarCodeScan = async({type,data}) => {
const {buttonState} = this.state
if(buttonState==="BookId") {
    this.setState({

        scaned:true,
        scannedBookId:data,
        buttonState:'normal'
    })
}
else if(buttonState==="StudentId") {
    this.setState({

        scaned:true,
        scannedStudentId:data,
        buttonState:'normal'
    })
}
}
initateBookIssue = async()=> {
    db.collection("Transactions").add({
        'studentId':this.state.scannedStudentId,
        'bookId':this.state.scannedBookId,
        'data':firebase.firestore.Timestamp.now().toDate(),
        'transactionType':"issued"
    })
    db.collection("Books").doc(this.state.scannedBookId).update({
        'Avalibility':false
    })
    db.collection("Students").doc(this.state.scannedStudentId).update({
        'BookIssued':firebase.firestore.FieldValue.increment(1)
    })
    this.setState({
        scannedStudentId:'',
        scannedBookId:''
    })
}
initateBookReturn = async()=> {
    db.collection("Transactions").add({
        'studentId':this.state.scannedStudentId,
        'bookId':this.state.scannedBookId,
        'data':firebase.firestore.Timestamp.now().toDate(),
        'transactionType':"return"
    })
    db.collection("Books").doc(this.state.scannedBookId).update({
        'Avalibility':true
    })
    db.collection("Students").doc(this.state.scannedStudentId).update({
        'BookIssued':firebase.firestore.FieldValue.increment(-1)
    })
    this.setState({
        scannedStudentId:'',
        scannedBookId:''
    })
}
HandleTransaction = ()=> {
    var transactionMessage
    db.collection("Books").doc(this.state.scannedBookId).get()
    .then((doc)=>{
        var Book = doc.data()
        console.log("Book ",Book)
        if(Book.Avalibility) {
            this.initateBookIssue()
            transactionMessage = "book Issued"
            ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
        }
        else {
            this.initateBookReturn()
            transactionMessage = "book Return"
            ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
        }
    })
    this.setState({
        transactionMessage:transactionMessage
    })

}

    render() {
        const hasCameraPermissions = this.state.hasCameraPermissions
        const scanned = this.state.scanned
        const buttonState = this.state.buttonState
        if (buttonState!=="normal" && hasCameraPermissions) {

            return(
                <BarCodeScanner 
                onBarCodeScanned = {scanned ? undefined : this.handleBarCodeScan}
                style = {StyleSheet.absoluteFillObject}
                />
            )
        }

        else if (buttonState==="normal") {

        return(
            <KeyboardAvoidingView style = {{flex:1,justifyContent:'center',alignItems:'center'}} behavior = "padding" enabled>
            <View style = {{flex:1,justifyContent:'center',alignItems:'center'}}>
                <View style = {styles.inputView}> 
                    <TextInput style={styles.inputbox}
                    placeholder="book id"
                    onChangeText = {text=>this.setState({scannedBookId:text})}
                    value = {this.state.scannedBookId}
                    />
                    <TouchableOpacity style = {styles.scanButton}
                onPress ={()=> {this.getCameraPermissions("BookId")}}
                >
                    <Text style = {styles.buttonText}> Scan </Text>
                </TouchableOpacity>
                </View>
                <View style = {styles.inputView}>
                <TextInput style={styles.inputbox}
                    placeholder="student id"
                    onChangeText = {text=>this.setState({scannedStudentId:text})}
                    value = {this.state.scannedStudentId}
                    />
                    <TouchableOpacity style = {styles.scanButton}
                onPress ={()=> {this.getCameraPermissions("StudentId")}}
                >
                    <Text style = {styles.buttonText}> Scan </Text>
                </TouchableOpacity>
                </View>
                <Text>
                    {this.state.transactionMessage}
                </Text>
                <TouchableOpacity style = {styles.SubmitButton}
                onPress = {async()=>{var transactionMessage = await this.HandleTransaction()
                this.setState({
                    scannedBookId:'',
                    scannedStudentId:''
                })}}
                >
                    <Text style = {styles.text}>
                        submit
                    </Text>
                </TouchableOpacity>
                
            </View>
            </KeyboardAvoidingView>
        )
        }
    }
}

const styles = StyleSheet.create({

    scanButton:{
        backgroundColor:'green',
        padding:10,
        margin:10
    },
    displayText:{

        fontSize:15,
        textDecorationLine:'underline'
    },
    buttonText:{
        fontSize: 15,
        textAlign: 'center',
        marginTop: 10
      },
      inputView:{
        flexDirection: 'row',
        margin: 20
      },
      inputBox:{
        width: 200,
        height: 40,
        borderWidth: 1.5,
        borderRightWidth: 0,
        fontSize: 20
      },
      scanButton:{
        backgroundColor: '#66BB6A',
        width: 50,
        borderWidth: 1.5,
        borderLeftWidth: 0
      },
      SubmitButton:{
          backgroundColor:'blue',
          width:100,
          height:30
      },
      text:{
          padding:10,
          textAlign:'center',
          fontSize:10,
          fontWeight:'bold',
          color:'white'
      } 
})