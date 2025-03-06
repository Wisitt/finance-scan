-- เปิดใช้งาน UUID Extension (ถ้ายังไม่มี)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: transactions
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    description TEXT,
    date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    receipt_images TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Table: categories
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    icon TEXT,
    color TEXT
);

-- Insert default categories
INSERT INTO public.categories (name, type, icon, color) VALUES
('เงินเดือน', 'income', 'Briefcase', '#4CAF50'),
('โบนัส', 'income', 'Award', '#8BC34A'),
('ของขวัญ', 'income', 'Gift', '#CDDC39'),
('เงินออม', 'income', 'Piggy', '#FFEB3B'),
('อื่นๆ (รายรับ)', 'income', 'Plus', '#FFC107'),
('อาหาร', 'expense', 'Utensils', '#F44336'),
('การเดินทาง', 'expense', 'Car', '#E91E63'),
('ที่พักอาศัย', 'expense', 'Home', '#9C27B0'),
('บิล/ค่าน้ำค่าไฟ', 'expense', 'Zap', '#673AB7'),
('สุขภาพ', 'expense', 'HeartPulse', '#3F51B5'),
('ช้อปปิ้ง', 'expense', 'ShoppingBag', '#2196F3'),
('บันเทิง', 'expense', 'Film', '#03A9F4'),
('อื่นๆ (รายจ่าย)', 'expense', 'Ellipsis', '#FF9800');


CREATE TABLE public.receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    merchant TEXT,
    date DATE,
    tax_id TEXT,
    items JSONB DEFAULT '[]'::JSONB,
    details TEXT,
    confidence DECIMAL(5,4),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_receipts_user_id ON public.receipts(user_id);
CREATE INDEX idx_receipts_transaction_id ON public.receipts(transaction_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'array_append_unique') THEN
    CREATE FUNCTION array_append_unique(arr TEXT[], element TEXT)
    RETURNS TEXT[] AS $$
    BEGIN
      IF element = ANY(arr) THEN
        RETURN arr;
      ELSE
        RETURN array_append(arr, element);
      END IF;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END;
$$;