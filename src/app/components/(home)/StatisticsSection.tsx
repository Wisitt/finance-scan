export default function StatisticsSection() {
    const stats = [
      { value: '10K+', label: 'ผู้ใช้งานทั่วประเทศ' },
      { value: '฿5M+', label: 'มูลค่าเงินที่บริหารต่อเดือน' },
      { value: '25%', label: 'เฉลี่ยการประหยัดค่าใช้จ่าย' },
      { value: '97%', label: 'ความพึงพอใจของผู้ใช้งาน' },
    ];
  
    return (
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }