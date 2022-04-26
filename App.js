import React, {useState} from 'react';
import {observer} from 'mobx-react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Dimensions,
  PixelRatio,
  TextStyle,
  ViewStyle,
} from 'react-native';

import {
  ViroARScene,
  ViroText,
  ViroBox,
  ViroARPlaneSelector,
  Viro3DObject,
  ViroARSceneNavigator,
  ViroMaterials,
  ViroAmbientLight,
  ViroSpotLight,
  ViroARPlane,
  ViroQuad,
  ViroNode,
  ViroAnimations,
  ViroImage,
  ViroConstants,
} from '@viro-community/react-viro';
import {useNavigation} from '@react-navigation/core';

// eslint-disable-next-line prettier/prettier
// const moveText = (newPosition) => {
//   console.log('yoyo', newPosition);
// };

// const onTouchtest = (state, touchPos, source) => {
//   console.log('source log: ', source);
//   if (state === 1) {
//     console.log('here is your touch down state :', touchPos);
//   } else if (state === 2) {
//     console.log('here is your touch down move state :', touchPos);
//   } else if (state === 3) {
//     console.log('here is your touch down up state :', touchPos);
//   }
// };

// const InitialScene = () => {
//   return (
//     <ViroARScene
//       displayPointCloud={{
//         imageSource: require('./assets/steering_wheel.png'),
//         imageScale: [0.001, 0.001, 0.001],
//         maxPoints: 800,
//       }}>
//       <ViroText
//         text={'Hola World'}
//         scale={[0.5, 0.5, 0.5]}
//         position={[0, 0, -1]}
//         onDrag={moveText}
//       />
//       <Viro3DObject
//         source={require('./assets/sphere.OBJ')}
//         position={[0, 0, -1]}
//         scale={[0.025, 0.025, 0.025]}
//         type="OBJ"
//         lightReceivingBitMask={3}
//         shadowCastingBitMask={2}
//         transformBehaviors={['billboardY']}
//         onDrag={onTouchtest}
//       />
//     </ViroARScene>
//   );
// };

const MeasureSceneAR = () => {
  const [initialized, setInitialized] = useState(false);
  const [text, setText] = useState('Initializing AR...');
  const [firstNodePlaced, setFirstNodePlaced] = useState(false);
  const [distance, setDistance] = useState(null);

  const arSceneRef = React.useRef(null);
  const nodeRef1 = React.useRef(null);
  const nodeRef2 = React.useRef(null);

  const _onTrackingUpdated = (state, reason) => {
    // if the state changes to "TRACKING_NORMAL" for the first time, then
    // that means the AR session has initialized!
    if (!initialized && state === ViroConstants.TRACKING_NORMAL) {
      setInitialized(true);
      setText('Hello World!');
    }
  };

  const handleSceneClick = source => {
    console.log('here is your log windor: ', Dimensions.get('window'));
    console.log('here is your log screen: ', Dimensions.get('screen'));
    arSceneRef.current.getCameraOrientationAsync().then(position => {
      arSceneRef.current
        .performARHitTestWithRay(
          // (Dimensions.get('window').width * PixelRatio.get()) / 2,
          // (Dimensions.get('window').height * PixelRatio.get()) / 2,
          position.forward,
        )
        .then(results => {
          for (var i = 0; i < results.length; i++) {
            let result = results[i];
            if (result.type === 'ExistingPlaneUsingExtent') {
              // We hit a plane, do something!
              if (firstNodePlaced) {
                console.log('move two');

                nodeRef2.current.setNativeProps({
                  position: result.transform.position,
                  visible: true,
                });

                nodeRef1.current.getTransformAsync().then(transform => {
                  console.log(transform.position);

                  getDistance(transform.position, result.transform.position);
                });
              } else {
                console.log('move one');

                nodeRef2.current.setNativeProps({visible: false});

                nodeRef1.current.setNativeProps({
                  position: result.transform.position,
                  visible: true,
                });

                setFirstNodePlaced(true);
              }
            }
          }
        });
    });
  };

  const getDistance = (positionOne, positionTwo) => {
    // Compute the difference vector between the two hit locations.
    const dx = positionOne[0] - positionTwo[0];
    const dy = positionOne[1] - positionTwo[1];
    const dz = positionOne[2] - positionTwo[2];

    // // Compute the straight-line distance.
    const distanceMeters = Math.sqrt(dx * dx + dy * dy + dz * dz);

    console.log(distanceMeters * 100);

    setDistance(distanceMeters * 100);
  };

  const handleDrag = (dragToPos, source) => {
    nodeRef1.current.getTransformAsync().then(transform => {
      console.log(transform.position);

      getDistance(transform.position, dragToPos);
    });
  };

  return (
    <ViroARScene
      ref={arSceneRef}
      // onTrackingUpdated={_onTrackingUpdated}
      onClick={handleSceneClick}>
      <ViroNode
        ref={nodeRef1}
        position={[0, 0, 0]}
        visible={true}
        onClick={() => {}}
        onDrag={() => {}}
        dragType="FixedToWorld">
        <ViroSpotLight
          innerAngle={5}
          outerAngle={45}
          direction={[0, -1, -0.2]}
          position={[0, 3, 0]}
          color="#ffffff"
          castsShadow={true}
          influenceBitMask={2}
          shadowMapSize={2048}
          shadowNearZ={2}
          shadowFarZ={5}
          shadowOpacity={0.7}
        />

        <Viro3DObject
          source={require('./assets/sphere.OBJ')}
          position={[0, 0, 0]}
          scale={[0.025, 0.025, 0.025]}
          type="OBJ"
          lightReceivingBitMask={3}
          shadowCastingBitMask={2}
          transformBehaviors={['billboardY']}
        />
      </ViroNode>

      <ViroNode
        ref={nodeRef2}
        position={[0, 0, 0]}
        visible={true}
        onClick={() => {}}
        onDrag={handleDrag}
        dragType="FixedToWorld">
        <ViroSpotLight
          innerAngle={5}
          outerAngle={45}
          direction={[0, -1, -0.2]}
          position={[0, 3, 0]}
          color="#ffffff"
          castsShadow={true}
          influenceBitMask={2}
          shadowMapSize={2048}
          shadowNearZ={2}
          shadowFarZ={5}
          shadowOpacity={0.7}
        />

        <Viro3DObject
          source={require('./assets/sphere.OBJ')}
          position={[0, 0, 0]}
          scale={[0.025, 0.025, 0.025]}
          type="OBJ"
          lightReceivingBitMask={3}
          shadowCastingBitMask={2}
          transformBehaviors={['billboardY']}
        />

        <ViroText
          text={distance ? distance.toFixed(2) + 'cm' : ''}
          scale={[0.1, 0.1, 0.1]}
          position={[0, 0, -0.05]}
        />
      </ViroNode>
    </ViroARScene>
  );
};

const App = observer(function App() {
  // const navigation = useNavigation()
  // const goBack = () => navigation.goBack()

  return (
    <ViroARSceneNavigator
      autofocus={true}
      initialScene={{
        scene: MeasureSceneAR,
      }}
      style={{flex: 1}}
    />
  );
});

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
