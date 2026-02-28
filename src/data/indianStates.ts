export interface IndianState {
  code: string;
  name: string;
  type: 'state' | 'union_territory';
  region: string;
  capital: string;
  description: string;
  highlights: string[];
  bestTime: string;
  coordinates: { x: number; y: number; width: number; height: number };
}

export const allIndianStates: IndianState[] = [
  // Northern States
  { 
    code: 'JK', 
    name: 'Jammu & Kashmir', 
    type: 'union_territory', 
    region: 'Northern', 
    capital: 'Srinagar', 
    description: 'Paradise on Earth with stunning landscapes and rich culture', 
    highlights: ['Dal Lake', 'Gulmarg', 'Pahalgam', 'Sonamarg'], 
    bestTime: 'April to October', 
    coordinates: { x: 20, y: 5, width: 15, height: 18 } 
  },
  { 
    code: 'LA', 
    name: 'Ladakh', 
    type: 'union_territory', 
    region: 'Northern', 
    capital: 'Leh', 
    description: 'High-altitude desert region with stunning landscapes and Buddhist culture', 
    highlights: ['Pangong Lake', 'Nubra Valley', 'Leh Palace', 'Hemis Monastery'], 
    bestTime: 'May to September', 
    coordinates: { x: 15, y: 2, width: 12, height: 15 } 
  },
  { 
    code: 'HP', 
    name: 'Himachal Pradesh', 
    type: 'state', 
    region: 'Northern', 
    capital: 'Shimla', 
    description: 'Dev Bhoomi - Land of Gods with stunning Himalayan landscapes', 
    highlights: ['Shimla', 'Manali', 'Dharamshala', 'Spiti Valley'], 
    bestTime: 'March to June, September to November', 
    coordinates: { x: 25, y: 15, width: 8, height: 12 } 
  },
  { 
    code: 'PB', 
    name: 'Punjab', 
    type: 'state', 
    region: 'Northern', 
    capital: 'Chandigarh', 
    description: 'Land of Five Rivers, rich in history and culture', 
    highlights: ['Golden Temple', 'Jallianwala Bagh', 'Wagah Border', 'Anandpur Sahib'], 
    bestTime: 'October to March', 
    coordinates: { x: 22, y: 20, width: 10, height: 8 } 
  },
  { 
    code: 'HR', 
    name: 'Haryana', 
    type: 'state', 
    region: 'Northern', 
    capital: 'Chandigarh', 
    description: 'Rich agricultural heritage and cultural diversity', 
    highlights: ['Kurukshetra', 'Panipat', 'Sultanpur National Park', 'Pinjore Gardens'], 
    bestTime: 'October to March', 
    coordinates: { x: 28, y: 22, width: 6, height: 6 } 
  },
  { 
    code: 'UK', 
    name: 'Uttarakhand', 
    type: 'state', 
    region: 'Northern', 
    capital: 'Dehradun', 
    description: 'Dev Bhoomi - Land of Gods with spiritual significance and natural beauty', 
    highlights: ['Rishikesh', 'Haridwar', 'Nainital', 'Mussoorie'], 
    bestTime: 'March to June, September to November', 
    coordinates: { x: 32, y: 18, width: 6, height: 10 } 
  },
  { 
    code: 'UP', 
    name: 'Uttar Pradesh', 
    type: 'state', 
    region: 'Northern', 
    capital: 'Lucknow', 
    description: 'Heart of India with ancient cities, monuments, and spiritual significance', 
    highlights: ['Taj Mahal', 'Varanasi', 'Agra Fort', 'Fatehpur Sikri'], 
    bestTime: 'October to March', 
    coordinates: { x: 30, y: 28, width: 12, height: 18 } 
  },
  { 
    code: 'DL', 
    name: 'Delhi', 
    type: 'union_territory', 
    region: 'Northern', 
    capital: 'New Delhi', 
    description: 'Capital city with rich history, monuments, and vibrant culture', 
    highlights: ['Red Fort', 'India Gate', 'Qutub Minar', 'Lotus Temple'], 
    bestTime: 'October to March', 
    coordinates: { x: 30, y: 25, width: 2, height: 2 } 
  },
  { 
    code: 'CH', 
    name: 'Chandigarh', 
    type: 'union_territory', 
    region: 'Northern', 
    capital: 'Chandigarh', 
    description: 'The City Beautiful, a well-planned city with modern architecture', 
    highlights: ['Rock Garden', 'Sukhna Lake', 'Rose Garden', 'Capitol Complex'], 
    bestTime: 'October to March', 
    coordinates: { x: 32, y: 22, width: 2, height: 2 } 
  },

  // Western States
  { 
    code: 'RJ', 
    name: 'Rajasthan', 
    type: 'state', 
    region: 'Western', 
    capital: 'Jaipur', 
    description: 'Land of kings with magnificent palaces, forts, and desert landscapes', 
    highlights: ['Jaipur', 'Udaipur', 'Jaisalmer', 'Jodhpur'], 
    bestTime: 'October to March', 
    coordinates: { x: 8, y: 25, width: 18, height: 20 } 
  },
  { 
    code: 'GJ', 
    name: 'Gujarat', 
    type: 'state', 
    region: 'Western', 
    capital: 'Gandhinagar', 
    description: 'Land of vibrant culture, historical monuments, and diverse landscapes', 
    highlights: ['Ahmedabad', 'Vadodara', 'Surat', 'Dwarka'], 
    bestTime: 'October to March', 
    coordinates: { x: 3, y: 40, width: 15, height: 18 } 
  },
  { 
    code: 'MH', 
    name: 'Maharashtra', 
    type: 'state', 
    region: 'Western', 
    capital: 'Mumbai', 
    description: 'Gateway to India with Bollywood, historical sites, and diverse landscapes', 
    highlights: ['Mumbai', 'Pune', 'Aurangabad', 'Nashik'], 
    bestTime: 'October to March', 
    coordinates: { x: 15, y: 45, width: 18, height: 22 } 
  },
  { 
    code: 'GA', 
    name: 'Goa', 
    type: 'state', 
    region: 'Western', 
    capital: 'Panaji', 
    description: 'Beaches, Portuguese heritage, and vibrant nightlife', 
    highlights: ['Baga Beach', 'Old Goa', 'Dudhsagar Falls', 'Anjuna Beach'], 
    bestTime: 'November to February', 
    coordinates: { x: 18, y: 65, width: 3, height: 4 } 
  },
  { 
    code: 'DN', 
    name: 'Dadra & Nagar Haveli', 
    type: 'union_territory', 
    region: 'Western', 
    capital: 'Silvassa', 
    description: 'Natural beauty and cultural heritage', 
    highlights: ['Silvassa', 'Vapi', 'Daman', 'Naroli'], 
    bestTime: 'October to March', 
    coordinates: { x: 16, y: 62, width: 3, height: 4 } 
  },
  { 
    code: 'DD', 
    name: 'Daman & Diu', 
    type: 'union_territory', 
    region: 'Western', 
    capital: 'Daman', 
    description: 'Beautiful beaches and Portuguese colonial heritage', 
    highlights: ['Daman', 'Diu', 'Nagoa Beach', 'Fort of Moti Daman'], 
    bestTime: 'October to March', 
    coordinates: { x: 14, y: 60, width: 2, height: 3 } 
  },

  // Central States
  { 
    code: 'MP', 
    name: 'Madhya Pradesh', 
    type: 'state', 
    region: 'Central', 
    capital: 'Bhopal', 
    description: 'Heart of India with ancient temples, wildlife sanctuaries, and natural beauty', 
    highlights: ['Bhopal', 'Indore', 'Gwalior', 'Khajuraho'], 
    bestTime: 'October to March', 
    coordinates: { x: 22, y: 40, width: 15, height: 20 } 
  },
  { 
    code: 'CT', 
    name: 'Chhattisgarh', 
    type: 'state', 
    region: 'Central', 
    capital: 'Raipur', 
    description: 'Land of dense forests, waterfalls, and rich tribal culture', 
    highlights: ['Raipur', 'Bilaspur', 'Jagdalpur', 'Bastar'], 
    bestTime: 'October to March', 
    coordinates: { x: 32, y: 45, width: 8, height: 12 } 
  },

  // Eastern States
  { 
    code: 'BR', 
    name: 'Bihar', 
    type: 'state', 
    region: 'Eastern', 
    capital: 'Patna', 
    description: 'Land of ancient history, religious significance, and cultural heritage', 
    highlights: ['Patna', 'Bodh Gaya', 'Nalanda', 'Vaishali'], 
    bestTime: 'October to March', 
    coordinates: { x: 40, y: 30, width: 8, height: 10 } 
  },
  { 
    code: 'JH', 
    name: 'Jharkhand', 
    type: 'state', 
    region: 'Eastern', 
    capital: 'Ranchi', 
    description: 'Land of waterfalls, forests, and rich mineral resources', 
    highlights: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'], 
    bestTime: 'October to March', 
    coordinates: { x: 42, y: 40, width: 8, height: 10 } 
  },
  { 
    code: 'WB', 
    name: 'West Bengal', 
    type: 'state', 
    region: 'Eastern', 
    capital: 'Kolkata', 
    description: 'Land of diverse landscapes, rich cultural heritage, and intellectual tradition', 
    highlights: ['Kolkata', 'Darjeeling', 'Sundarbans', 'Shantiniketan'], 
    bestTime: 'October to March', 
    coordinates: { x: 45, y: 32, width: 12, height: 15 } 
  },
  { 
    code: 'OR', 
    name: 'Odisha', 
    type: 'state', 
    region: 'Eastern', 
    capital: 'Bhubaneswar', 
    description: 'Land of ancient temples, beautiful beaches, and tribal culture', 
    highlights: ['Bhubaneswar', 'Puri', 'Konark', 'Cuttack'], 
    bestTime: 'October to March', 
    coordinates: { x: 44, y: 48, width: 10, height: 12 } 
  },

  // Southern States
  { 
    code: 'KA', 
    name: 'Karnataka', 
    type: 'state', 
    region: 'Southern', 
    capital: 'Bangalore', 
    description: 'Silicon Valley of India with ancient temples, hill stations, and coffee plantations', 
    highlights: ['Bangalore', 'Mysore', 'Hampi', 'Coorg'], 
    bestTime: 'October to February', 
    coordinates: { x: 30, y: 65, width: 12, height: 15 } 
  },
  { 
    code: 'TG', 
    name: 'Telangana', 
    type: 'state', 
    region: 'Southern', 
    capital: 'Hyderabad', 
    description: 'Rich history, cultural heritage, and modern development', 
    highlights: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'], 
    bestTime: 'October to March', 
    coordinates: { x: 35, y: 60, width: 6, height: 8 } 
  },
  { 
    code: 'AP', 
    name: 'Andhra Pradesh', 
    type: 'state', 
    region: 'Southern', 
    capital: 'Amaravati', 
    description: 'Land of rich history, beautiful beaches, and diverse cultural heritage', 
    highlights: ['Visakhapatnam', 'Tirupati', 'Vijayawada', 'Guntur'], 
    bestTime: 'October to March', 
    coordinates: { x: 40, y: 65, width: 8, height: 12 } 
  },
  { 
    code: 'TN', 
    name: 'Tamil Nadu', 
    type: 'state', 
    region: 'Southern', 
    capital: 'Chennai', 
    description: 'Land of temples with Dravidian architecture and rich cultural heritage', 
    highlights: ['Chennai', 'Madurai', 'Coimbatore', 'Tiruchirappalli'], 
    bestTime: 'October to March', 
    coordinates: { x: 42, y: 75, width: 10, height: 15 } 
  },
  { 
    code: 'KL', 
    name: 'Kerala', 
    type: 'state', 
    region: 'Southern', 
    capital: 'Thiruvananthapuram', 
    description: 'God\'s Own Country - Backwaters, hill stations, and Ayurveda', 
    highlights: ['Kochi', 'Munnar', 'Alleppey', 'Thekkady'], 
    bestTime: 'September to March', 
    coordinates: { x: 38, y: 85, width: 6, height: 8 } 
  },
  { 
    code: 'PY', 
    name: 'Puducherry', 
    type: 'union_territory', 
    region: 'Southern', 
    capital: 'Puducherry', 
    description: 'Beautiful beaches and French colonial heritage', 
    highlights: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'], 
    bestTime: 'October to March', 
    coordinates: { x: 44, y: 80, width: 3, height: 4 } 
  },

  // Northeastern States
  { 
    code: 'AS', 
    name: 'Assam', 
    type: 'state', 
    region: 'Northeastern', 
    capital: 'Dispur', 
    description: 'Gateway to Northeast India, known for tea plantations and wildlife', 
    highlights: ['Guwahati', 'Kaziranga', 'Manas', 'Tezpur'], 
    bestTime: 'October to April', 
    coordinates: { x: 55, y: 25, width: 12, height: 15 } 
  },
  { 
    code: 'AR', 
    name: 'Arunachal Pradesh', 
    type: 'state', 
    region: 'Northeastern', 
    capital: 'Itanagar', 
    description: 'Land of the Dawn-Lit Mountains with pristine natural beauty', 
    highlights: ['Itanagar', 'Tawang', 'Ziro', 'Bomdila'], 
    bestTime: 'October to April', 
    coordinates: { x: 65, y: 15, width: 15, height: 20 } 
  },
  { 
    code: 'NL', 
    name: 'Nagaland', 
    type: 'state', 
    region: 'Northeastern', 
    capital: 'Kohima', 
    description: 'Land of Festivals, known for its rich tribal culture and natural beauty', 
    highlights: ['Kohima', 'Dimapur', 'Mokokchung', 'Wokha'], 
    bestTime: 'October to May', 
    coordinates: { x: 68, y: 28, width: 6, height: 8 } 
  },
  { 
    code: 'MN', 
    name: 'Manipur', 
    type: 'state', 
    region: 'Northeastern', 
    capital: 'Imphal', 
    description: 'Jewel of India, known for its natural beauty and cultural diversity', 
    highlights: ['Imphal', 'Loktak Lake', 'Ukhrul', 'Churachandpur'], 
    bestTime: 'October to May', 
    coordinates: { x: 70, y: 32, width: 6, height: 8 } 
  },
  { 
    code: 'ML', 
    name: 'Meghalaya', 
    type: 'state', 
    region: 'Northeastern', 
    capital: 'Shillong', 
    description: 'Abode of Clouds, famous for its waterfalls and living root bridges', 
    highlights: ['Shillong', 'Cherrapunji', 'Mawlynnong', 'Nongpoh'], 
    bestTime: 'October to May', 
    coordinates: { x: 62, y: 30, width: 6, height: 8 } 
  },
  { 
    code: 'MZ', 
    name: 'Mizoram', 
    type: 'state', 
    region: 'Northeastern', 
    capital: 'Aizawl', 
    description: 'Land of the Hill People, known for its lush hills and vibrant culture', 
    highlights: ['Aizawl', 'Lunglei', 'Champhai', 'Kolasib'], 
    bestTime: 'October to May', 
    coordinates: { x: 70, y: 38, width: 6, height: 8 } 
  },
  { 
    code: 'TR', 
    name: 'Tripura', 
    type: 'state', 
    region: 'Northeastern', 
    capital: 'Agartala', 
    description: 'Land of temples, palaces, and rich cultural heritage', 
    highlights: ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar'], 
    bestTime: 'October to May', 
    coordinates: { x: 72, y: 35, width: 4, height: 6 } 
  },
  { 
    code: 'SK', 
    name: 'Sikkim', 
    type: 'state', 
    region: 'Northeastern', 
    capital: 'Gangtok', 
    description: 'Himalayan state with stunning natural beauty and Buddhist culture', 
    highlights: ['Gangtok', 'Pelling', 'Lachung', 'Namchi'], 
    bestTime: 'March to June, September to December', 
    coordinates: { x: 58, y: 22, width: 4, height: 6 } 
  },

  // Union Territories - Islands
  { 
    code: 'LD', 
    name: 'Lakshadweep', 
    type: 'union_territory', 
    region: 'Islands', 
    capital: 'Kavaratti', 
    description: 'Coral islands with pristine beaches and marine life', 
    highlights: ['Kavaratti', 'Agatti', 'Bangaram', 'Kadmat'], 
    bestTime: 'October to March', 
    coordinates: { x: 8, y: 80, width: 4, height: 6 } 
  },
  { 
    code: 'AN', 
    name: 'Andaman & Nicobar Islands', 
    type: 'union_territory', 
    region: 'Islands', 
    capital: 'Port Blair', 
    description: 'Island paradise with pristine beaches and unique tribal culture', 
    highlights: ['Port Blair', 'Havelock Island', 'Neil Island', 'Ross Island'], 
    bestTime: 'October to May', 
    coordinates: { x: 75, y: 70, width: 12, height: 18 } 
  }
];

const normalizeStateCode = (code: string) => {
  if (code === 'UT') return 'UK';
  return code;
};

export const getStateByCode = (code: string): IndianState | undefined => {
  return allIndianStates.find(state => state.code === normalizeStateCode(code));
};

export const getStatesByRegion = (region: string): IndianState[] => {
  return allIndianStates.filter(state => state.region === region);
};

export const getAllRegions = (): string[] => {
  return Array.from(new Set(allIndianStates.map(state => state.region)));
};
