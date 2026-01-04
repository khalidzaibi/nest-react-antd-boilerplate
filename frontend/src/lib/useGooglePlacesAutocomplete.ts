import { useEffect, useRef, useState } from 'react';

type Prediction = { description: string; place_id: string };

type UseGooglePlacesAutocompleteParams = {
  apiKey?: string;
  fields?: string[];
  onPlaceDetails?: (place: any, prediction: Prediction) => void;
};

type UseGooglePlacesAutocompleteReturn = {
  ready: boolean;
  hasApiKey: boolean;
  usingHttpAutocomplete: boolean;
  query: string;
  setQuery: (q: string) => void;
  loading: boolean;
  predictions: Prediction[];
  fetchPredictions: (text: string) => void;
  handlePredictionSelect: (prediction: Prediction) => Promise<any | null>;
  resetPredictions: () => void;
};

/**
 * Shared loader + autocomplete helper for Google Places (JS Maps loader).
 * Injects the script only once and exposes predictions + selection handler.
 */
export const useGooglePlacesAutocomplete = ({
  apiKey,
  fields = ['address_components', 'formatted_address'],
  onPlaceDetails,
}: UseGooglePlacesAutocompleteParams): UseGooglePlacesAutocompleteReturn => {
  const resolvedApiKey = apiKey ?? (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined);
  const [ready, setReady] = useState(Boolean(resolvedApiKey));
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [usingHttpAutocomplete] = useState(true); // Prefer HTTP Autocomplete (Places API New)

  // Once an API key is available, mark ready (HTTP-only flow, no JS SDK dependency).
  useEffect(() => {
    setReady(Boolean(resolvedApiKey));
    if (resolvedApiKey && query.trim()) {
      fetchPredictions(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedApiKey]);

  const fetchViaHttpAutocomplete = async (text: string) => {
    if (!resolvedApiKey) return [];
    try {
      const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': resolvedApiKey,
        },
        body: JSON.stringify({
          input: text,
          languageCode: 'en',
        }),
      });
      if (!res.ok) return [];
      const data = await res.json();
      const suggestions = data?.suggestions ?? [];
      return suggestions
        .map((s: any) => {
          const placeId = s.placePrediction?.placeId ?? s.placeId ?? null;
          const description =
            s.placePrediction?.text?.text ??
            s.placePrediction?.structuredFormat?.mainText?.text ??
            s.formattedSuggestion ??
            null;
          if (!placeId || !description) return null;
          return { description, place_id: placeId };
        })
        .filter(Boolean) as Prediction[];
    } catch (err) {
      console.error('HTTP autocomplete failed', err);
      return [];
    }
  };

  const fetchPredictions = (text: string) => {
    if (!text.trim() || !resolvedApiKey) {
      setPredictions([]);
      return;
    }
    setLoading(true);
    fetchViaHttpAutocomplete(text).then(list => {
      setLoading(false);
      setPredictions(list);
    });
  };

  const fetchPlaceDetailsHttp = async (placeId: string) => {
    if (!resolvedApiKey) return null;
    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(
          placeId,
        )}?fields=addressComponents,formattedAddress,location,location.latitude,location.longitude,addressComponents.shortText,addressComponents.longText`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': resolvedApiKey,
          },
        },
      );
      if (!res.ok) return null;
      return res.json();
    } catch (err) {
      console.error('HTTP place details failed', err);
      return null;
    }
  };

  const handlePredictionSelect = async (prediction: Prediction) => {
    setQuery(prediction.description);
    const place = await fetchPlaceDetailsHttp(prediction.place_id);
    if (!place) return;
    onPlaceDetails?.(place, prediction);
    return place;
  };

  const resetPredictions = () => setPredictions([]);

  return {
    ready,
    query,
    setQuery,
    loading,
    predictions,
    fetchPredictions,
    handlePredictionSelect,
    resetPredictions,
    hasApiKey: Boolean(resolvedApiKey),
    usingHttpAutocomplete,
  };
};
