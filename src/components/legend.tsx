const Legend = () => {

    const getRiskColorClass = (risk?: string) => {
        switch (risk) {
          case 'High': return 'bg-red-600';
          case 'Medium': return 'bg-orange-600';
          case 'Low': return 'bg-green-600';
        }
    };
    return (
        <div className="bg-white rounded-lg shadow-md z-10 border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 text-white px-3 py-2">
          <h3 className="font-medium text-sm">Risk Legend</h3>
        </div>
        <div className="p-3">
          {['High', 'Medium','Low'].map((level) => (
            <div key={level} className="flex items-center mb-2 last:mb-0">
              <div className={`w-4 h-4 mr-2 rounded ${getRiskColorClass(level)}`}></div>
              <span className="text-sm text-slate-800">{level} Risk</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

export default Legend;