import { useEffect } from 'react';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../config/firebase';

export function useAnalytics() {
  // Track page view on mount
  useEffect(() => {
    logEvent(analytics, 'page_view', {
      page_title: document.title,
      page_location: window.location.href
    });
  }, []);

  const trackCalculation = (results, interpretations, strongCount, acceptableCount) => {
    const { irr, dscr, roic, npv } = results;
    const irrPercent = irr * 100;
    const roicPercent = roic * 100;
    const riskFreeRate = 4.0;

    logEvent(analytics, 'calculation_performed', {
      investment_status: results.status || 'unknown',
      npv_positive: npv > 0,
      irr_category: irrPercent > 6 ? 'strong' : irrPercent > riskFreeRate ? 'marginal' : 'weak',
      dscr_category: dscr > 1.25 ? 'healthy' : dscr >= 1.0 ? 'tight' : 'insufficient',
      roic_category: roicPercent > 50 ? 'strong' : roicPercent > 20 ? 'moderate' : 'weak',
      strong_metrics_count: strongCount,
      acceptable_metrics_count: acceptableCount
    });
  };

  const trackInputChange = (fieldName, fieldType) => {
    logEvent(analytics, 'input_changed', {
      field_name: fieldName,
      field_type: fieldType
    });
  };

  return {
    trackCalculation,
    trackInputChange
  };
}
