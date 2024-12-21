import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="text-2xl font-bold text-blue-600">ColorCard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="bg-gray-100">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large" className="text-3xl font-bold text-blue-600">ColorCard</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome to ColorCard</h2>
            <p className="text-gray-600">
              A beautiful cross-platform application built with Ionic React and Tailwind CSS.
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
