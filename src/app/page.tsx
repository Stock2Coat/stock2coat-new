export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welkom bij Stock2coat</h1>
        <p className="text-gray-600">
          Uw poedercoating voorraadbeheersysteem voor efficiënt voorraadbeheer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Totaal Items</h3>
          <p className="text-3xl font-bold text-blue-600">156</p>
          <p className="text-sm text-gray-500">poedersoorten in voorraad</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Lage Voorraad</h3>
          <p className="text-3xl font-bold text-orange-600">8</p>
          <p className="text-sm text-gray-500">items onder minimum niveau</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Totale Waarde</h3>
          <p className="text-3xl font-bold text-green-600">€24.580</p>
          <p className="text-sm text-gray-500">huidige voorraadwaarde</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Verbruik</h3>
          <p className="text-3xl font-bold text-purple-600">12</p>
          <p className="text-sm text-gray-500">transacties vandaag</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recente Activiteit</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">RAL 9010 Wit - 20kg gebruikt</p>
              <p className="text-sm text-gray-500">Door: Jan Janssen • 14:30</p>
            </div>
            <span className="text-sm text-gray-400">Vandaag</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">RAL 7016 Antraciet - 15kg toegevoegd</p>
              <p className="text-sm text-gray-500">Door: Piet Peters • 11:20</p>
            </div>
            <span className="text-sm text-gray-400">Vandaag</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900">RAL 6005 Mosgroen - Lage voorraad waarschuwing</p>
              <p className="text-sm text-gray-500">Systeem • 09:15</p>
            </div>
            <span className="text-sm text-gray-400">Vandaag</span>
          </div>
        </div>
      </div>
    </div>
  );
}
