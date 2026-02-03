import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useFirestore() {
  const saveCalculation = async (inputs, results, interpretations, strongCount, acceptableCount) => {
    try {
      const docRef = await addDoc(collection(db, 'calculations'), {
        timestamp: serverTimestamp(),

        // Inputs
        inputs: inputs,

        // Results
        results: {
          status: results.status || 'unknown',
          dcf: Math.round(results.dcf),
          npv: Math.round(results.npv),
          irr: Math.round(results.irr * 10000) / 100,
          dscr: Math.round(results.dscr * 100) / 100,
          roic: Math.round(results.roic * 10000) / 100,
          investedCapital: Math.round(results.investedCapital)
        },

        // Interpretations
        interpretations: {
          npv: interpretations.npv.interpretation,
          irr: interpretations.irr.interpretation,
          dscr: interpretations.dscr.interpretation,
          roic: interpretations.roic.interpretation
        },

        // Metadata
        strongMetrics: strongCount,
        acceptableMetrics: acceptableCount,
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight
      });

      console.log('💾 Calculation saved to Firestore:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Firestore error:', error);
      throw error;
    }
  };

  return {
    saveCalculation
  };
}
