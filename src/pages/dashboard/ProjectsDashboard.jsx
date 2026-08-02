import React from 'react';
import { 
  Search, 
  MessageSquare, 
  Globe, 
  ChevronDown, 
  LayoutDashboard, 
  Activity, 
  Users, 
  FileText, 
  ShoppingCart, 
  Settings,
  Database,
  Trash2,
  Bug,
  MoreVertical,
  Menu,
  CheckCircle2,
  Circle,
  Plus
} from 'lucide-react';

const ProjectsDashboard = () => {
  return (
    <div className="flex h-screen bg-[#F1F5F9] font-sans text-slate-800 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-[80px] bg-white flex flex-col items-center py-6 border-r border-slate-200 z-10 hidden md:flex shrink-0">
        <div className="w-10 h-10 bg-[#4F46E5] rounded-xl flex items-center justify-center text-white font-bold text-xl mb-10">
          R
        </div>
        
        <nav className="flex-1 flex flex-col items-center space-y-6">
          <button className="p-3 bg-[#4F46E5] text-white rounded-xl shadow-lg shadow-indigo-500/30">
            <LayoutDashboard className="w-5 h-5" />
          </button>
          <button className="p-3 text-slate-400 hover:text-[#4F46E5] hover:bg-indigo-50 rounded-xl transition-colors">
            <Activity className="w-5 h-5" />
          </button>
          <button className="p-3 text-slate-400 hover:text-[#4F46E5] hover:bg-indigo-50 rounded-xl transition-colors">
            <Users className="w-5 h-5" />
          </button>
          <button className="p-3 text-slate-400 hover:text-[#4F46E5] hover:bg-indigo-50 rounded-xl transition-colors">
            <FileText className="w-5 h-5" />
          </button>
          <button className="p-3 text-slate-400 hover:text-[#4F46E5] hover:bg-indigo-50 rounded-xl transition-colors">
            <ShoppingCart className="w-5 h-5" />
          </button>
          <button className="p-3 text-slate-400 hover:text-[#4F46E5] hover:bg-indigo-50 rounded-xl transition-colors">
            <LayoutDashboard className="w-5 h-5" />
          </button>
        </nav>
        
        <div className="mt-auto flex flex-col items-center space-y-4">
          <button className="p-3 text-slate-400 hover:text-[#4F46E5] hover:bg-indigo-50 rounded-xl transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-3 text-slate-400 hover:text-[#4F46E5] hover:bg-indigo-50 rounded-xl transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-[76px] flex items-center justify-between px-8 shrink-0">
          <div className="flex-1 flex items-center">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full bg-white border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button className="relative text-slate-500 hover:text-[#4F46E5] transition-colors">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button className="bg-[#4F46E5] hover:bg-[#4338ca] text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center space-x-2 shadow-md shadow-indigo-500/20 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Create Workspace</span>
            </button>
            
            <div className="flex items-center space-x-2 text-slate-600 font-medium text-sm cursor-pointer hover:text-[#4F46E5] transition-colors">
              <Globe className="w-4 h-4" />
              <span>EN</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            
            <div className="flex items-center space-x-3 cursor-pointer">
              <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" />
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">John Doe</p>
                <p className="text-[11px] text-slate-500">@johndoe</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Dashboard Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          
          <div className="mb-6">
            <h1 className="text-[28px] font-bold text-slate-800 leading-tight">Dashboard</h1>
            <p className="text-sm text-slate-400 font-medium">Dashboard <span className="text-[#4F46E5]">/ Projects</span></p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-[#4F46E5] mb-6">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-slate-400 text-sm font-semibold mb-1">Total Projects</h3>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-extrabold text-slate-800">23</span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center space-x-1">
                  <span>↑</span>
                  <span>32.54%</span>
                </span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 mb-6">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-slate-400 text-sm font-semibold mb-1">Total Tasks</h3>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-extrabold text-slate-800">23</span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center space-x-1">
                  <span>↑</span>
                  <span>32.54%</span>
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
              <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-500 mb-6">
                <Bug className="w-6 h-6" />
              </div>
              <h3 className="text-slate-400 text-sm font-semibold mb-1">Total Bugs</h3>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-extrabold text-slate-800">23</span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center space-x-1">
                  <span>↑</span>
                  <span>32.54%</span>
                </span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-slate-400 text-sm font-semibold mb-1">Total Users</h3>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-extrabold text-slate-800">23</span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center space-x-1">
                  <span>↑</span>
                  <span>32.54%</span>
                </span>
              </div>
            </div>
          </div>

          {/* Middle Section - Chart & Tasks Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Project Overview Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Project Overview</h2>
                  <div className="flex items-center space-x-2 mt-2 text-sm">
                    <span className="text-[#4F46E5] font-semibold flex items-center">
                      <span className="mr-1">↗</span> 89% Project Successful
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-1">Overviewing Of Last 6 Month Projects</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 flex items-center cursor-pointer">
                    Last 6 Month <ChevronDown className="w-3 h-3 ml-2" />
                  </div>
                  <div className="flex items-center space-x-4 text-xs font-semibold text-slate-500 mt-2">
                    <div className="flex items-center"><span className="w-2.5 h-2.5 bg-emerald-400 rounded-sm mr-2"></span>New Clients</div>
                    <div className="flex items-center"><span className="w-2.5 h-2.5 bg-[#4F46E5] rounded-sm mr-2"></span>Old Clients</div>
                  </div>
                </div>
              </div>
              
              {/* Fake SVG Chart since Recharts couldn't be installed */}
              <div className="h-[250px] w-full mt-4 relative">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-slate-400 font-medium py-2 z-10 w-8">
                  <span>1000</span><span>900</span><span>800</span><span>700</span><span>600</span><span>500</span><span>400</span><span>300</span><span>200</span><span>100</span><span>0</span>
                </div>
                
                {/* Chart Area */}
                <div className="absolute left-8 right-0 top-0 bottom-6 border-b border-slate-100 border-dashed">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[1,2,3,4,5,6,7,8,9,10,11].map((i) => (
                      <div key={i} className="w-full h-[1px] bg-slate-50"></div>
                    ))}
                  </div>

                  {/* SVG Area Chart Mockup */}
                  <svg className="w-full h-full absolute inset-0 z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="colorOld" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    
                    {/* Old Clients Area & Line */}
                    <path d="M0,90 L10,75 L20,72 L30,60 L40,58 L50,45 L60,40 L70,35 L80,25 L90,20 L100,5 L100,100 L0,100 Z" fill="url(#colorOld)" />
                    <path d="M0,90 L10,75 L20,72 L30,60 L40,58 L50,45 L60,40 L70,35 L80,25 L90,20 L100,5" fill="none" stroke="#4F46E5" strokeWidth="2" strokeDasharray="3,3" />

                    {/* New Clients Area & Line */}
                    <path d="M0,95 L10,92 L20,90 L30,88 L40,85 L50,83 L60,80 L70,78 L80,75 L90,72 L100,70 L100,100 L0,100 Z" fill="url(#colorNew)" />
                    <path d="M0,95 L10,92 L20,90 L30,88 L40,85 L50,83 L60,80 L70,78 L80,75 L90,72 L100,70" fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="3,3" />
                  </svg>
                </div>
                
                {/* X-axis labels */}
                <div className="absolute left-8 right-0 bottom-0 h-6 flex justify-between items-end text-[10px] text-slate-400 font-medium px-4">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>
              </div>
            </div>

            {/* Tasks Status Card */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-slate-800">Tasks Status</h2>
                  <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 flex items-center cursor-pointer">
                    Today <ChevronDown className="w-3 h-3 ml-2" />
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className="text-4xl font-extrabold text-slate-800">54</span>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Task Right Now This Month</p>
                </div>

                {/* Progress Bar composite */}
                <div className="w-full h-2 rounded-full overflow-hidden flex mb-8">
                  <div className="h-full bg-emerald-500 w-[40%]"></div>
                  <div className="h-full bg-sky-500 w-[30%]"></div>
                  <div className="h-full bg-red-500 w-[30%]"></div>
                </div>

                {/* Status List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm font-semibold text-slate-600">
                      <span className="w-2.5 h-2.5 bg-sky-500 rounded-sm mr-3"></span>
                      On Going
                    </div>
                    <div className="text-xs font-bold text-sky-500 bg-sky-50 px-2 py-0.5 rounded">+12</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm font-semibold text-slate-600">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-sm mr-3"></span>
                      On Hold
                    </div>
                    <div className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">+32</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm font-semibold text-slate-600">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm mr-3"></span>
                      Finished
                    </div>
                    <div className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">+12</div>
                  </div>
                </div>
              </div>

              <button className="w-full bg-[#4F46E5] hover:bg-[#4338ca] text-white py-3 rounded-xl font-medium mt-6 shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]">
                Create New Task
              </button>
            </div>

          </div>

          {/* Tasks Table */}
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b border-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Tasks</h2>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-400 font-medium">Select Date</span>
                <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 flex items-center cursor-pointer">
                  Today <ChevronDown className="w-3 h-3 ml-2" />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                    <th className="px-6 py-4 rounded-tl-xl"><div className="w-4 h-4 rounded border border-slate-200"></div></th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Assigned Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Assigned To</th>
                    <th className="px-6 py-4">Progress</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-semibold text-slate-700">
                  <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                    <td className="px-6 py-4"><div className="w-4 h-4 rounded border border-slate-200"></div></td>
                    <td className="px-6 py-4">Catalog</td>
                    <td className="px-6 py-4 text-slate-400 font-medium text-xs">5/27/15</td>
                    <td className="px-6 py-4"><span className="bg-sky-50 text-sky-500 px-3 py-1 rounded-full text-[11px] font-bold">On-Going</span></td>
                    <td className="px-6 py-4 text-slate-400 font-medium text-xs">5/27/15</td>
                    <td className="px-6 py-4"><span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-md text-[11px] font-bold">High</span></td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        <img className="w-7 h-7 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?img=33" alt="" />
                        <img className="w-7 h-7 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?img=12" alt="" />
                        <img className="w-7 h-7 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?img=47" alt="" />
                        <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold">+</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[50%] rounded-full"></div>
                        </div>
                        <span className="text-xs text-slate-400 font-bold">50%</span>
                      </div>
                    </td>
                  </tr>
                  
                  <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                    <td className="px-6 py-4"><div className="w-4 h-4 rounded border border-slate-200 bg-indigo-500 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-white" /></div></td>
                    <td className="px-6 py-4">Contact</td>
                    <td className="px-6 py-4 text-slate-400 font-medium text-xs">5/27/15</td>
                    <td className="px-6 py-4"><span className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-[11px] font-bold">On-Hold</span></td>
                    <td className="px-6 py-4 text-slate-400 font-medium text-xs">5/27/15</td>
                    <td className="px-6 py-4"><span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-md text-[11px] font-bold">Low</span></td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        <img className="w-7 h-7 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?img=33" alt="" />
                        <img className="w-7 h-7 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?img=47" alt="" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[25%] rounded-full"></div>
                        </div>
                        <span className="text-xs text-slate-400 font-bold">25%</span>
                      </div>
                    </td>
                  </tr>
                  
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default ProjectsDashboard;
