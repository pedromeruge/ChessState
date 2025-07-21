import { Redirect } from 'expo-router';

// optional page
// define the default redirect router for the play tab 
export default function Index() {
  return <Redirect href="/play/timers_preset" />;
}